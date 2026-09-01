/* =====================================================
   ROUTE CALCULATOR — OpenStreetMap + OSRM + Haversine fallback
   ===================================================== */
(function () {
  if (typeof L === 'undefined') return;

  let rcMap = null, rcRouteLayer = null, rcPickupMarker = null, rcDropMarker = null;
  let activeRate = 15, activeBase = 300, activeBata = 250, activeVehicle = 'Sedan';

  function initRCMap() {
    if (rcMap) return;
    rcMap = L.map('rcMap', { zoomControl: true, scrollWheelZoom: false }).setView([11.0, 78.5], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>', maxZoom: 18
    }).addTo(rcMap);
  }

  async function geocode(query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', India')}&limit=1&accept-language=en`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.length) throw new Error('Location not found: ' + query);
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  }

  async function getSuggestions(query) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', India')}&limit=6&accept-language=en&addressdetails=1`;
      const res = await fetch(url);
      return await res.json();
    } catch (_) { return []; }
  }

  async function getOSRMRoute(from, to) {
    const urls = [
      `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`,
      `https://routing.openstreetmap.de/routed-car/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`
    ];
    for (const url of urls) {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 8000);
        const res = await fetch(url, { signal: ctrl.signal });
        clearTimeout(t);
        const data = await res.json();
        if (data.routes && data.routes.length) {
          const r = data.routes[0];
          return { distanceKm: (r.distance/1000).toFixed(1), durationMin: Math.round(r.duration/60), geometry: r.geometry };
        }
      } catch (_) {}
    }
    return null;
  }

  function haversineKm(a, b) {
    const R = 6371, dLat = (b.lat-a.lat)*Math.PI/180, dLon = (b.lon-a.lon)*Math.PI/180;
    const h = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;
    return (R*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h))*1.3).toFixed(1);
  }

  function fmtDur(m) { const h=Math.floor(m/60),r=m%60; return h?`${h} hr${h>1?'s':''} ${r?r+' min':''}`.trim():`${r} min`; }
  function inr(n) { return '\u20B9' + Math.round(n).toLocaleString('en-IN'); }
  function dot(color) {
    return L.divIcon({ className:'', iconSize:[14,14], iconAnchor:[7,7],
      html:`<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5)"></div>` });
  }

  function setupNominatimAC(inputId, listId) {
    const input = document.getElementById(inputId);
    const list  = document.getElementById(listId);
    if (!input || !list) return;
    let timer = null, activeIdx = -1;

    function closeAC() { list.classList.remove('show'); list.innerHTML = ''; activeIdx = -1; }

    function render(results) {
      list.innerHTML = '';
      if (!results.length) { closeAC(); return; }
      results.forEach(item => {
        const li = document.createElement('li');
        const addr = item.address || {};
        const city  = addr.city || addr.town || addr.village || addr.county || item.display_name.split(',')[0].trim();
        const state = addr.state || '';
        li.innerHTML = `<i class="fas fa-map-marker-alt"></i><span><strong class="ac-area">${city}</strong><span class="ac-city">${state}</span></span>`;
        li.dataset.val = state ? `${city}, ${state}` : city;
        li.addEventListener('mousedown', e => { e.preventDefault(); input.value = li.dataset.val; closeAC(); });
        list.appendChild(li);
      });
      list.classList.add('show');
    }

    input.addEventListener('input', function () {
      clearTimeout(timer);
      const q = this.value.trim();
      if (q.length < 2) { closeAC(); return; }
      const lower = q.toLowerCase();
      const local = LOCATIONS.filter(l => l.a.toLowerCase().includes(lower) || l.c.toLowerCase().includes(lower))
        .slice(0, 6).map(l => ({ display_name:`${l.a},${l.c},${l.s}`, address:{ city:l.a, state:l.s } }));
      if (local.length) render(local);
      timer = setTimeout(async () => { const live = await getSuggestions(q); if (live.length) render(live); }, 400);
    });

    input.addEventListener('keydown', e => {
      const items = list.querySelectorAll('li');
      if (!items.length) return;
      if (e.key==='ArrowDown') { e.preventDefault(); activeIdx=Math.min(activeIdx+1,items.length-1); items.forEach((li,i)=>li.classList.toggle('active',i===activeIdx)); }
      else if (e.key==='ArrowUp') { e.preventDefault(); activeIdx=Math.max(activeIdx-1,0); items.forEach((li,i)=>li.classList.toggle('active',i===activeIdx)); }
      else if (e.key==='Enter' && activeIdx>=0) { e.preventDefault(); items[activeIdx].dispatchEvent(new MouseEvent('mousedown')); }
      else if (e.key==='Escape') closeAC();
    });
    document.addEventListener('click', e => { if (!input.contains(e.target) && !list.contains(e.target)) closeAC(); });
  }

  async function calculateRoute() {
    const pickup = document.getElementById('rcPickup').value.trim();
    const drop   = document.getElementById('rcDrop').value.trim();
    const isRT   = document.querySelector('input[name="rcTrip"]:checked').value === 'roundtrip';
    if (!pickup || !drop) { alert('Please enter both pickup and drop locations.'); return; }
    const btn = document.getElementById('rcCalcBtn');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
    try {
      initRCMap();
      const [from, to] = await Promise.all([geocode(pickup), geocode(drop)]);
      let route = await getOSRMRoute(from, to), fallback = false;
      if (!route) { fallback=true; const km=haversineKm(from,to); route={distanceKm:km,durationMin:Math.round(parseFloat(km)/55*60),geometry:null}; }
      const dist=parseFloat(route.distanceKm), actualDist=isRT?dist*2:dist;
      const baseFare=Math.round(actualDist*activeRate), total=baseFare+activeBata;
      const dStr=actualDist.toFixed(1), tStr=fmtDur(route.durationMin*(isRT?2:1));
      document.getElementById('rcDistance').textContent = dStr+' km'+(fallback?' ≈':'');
      document.getElementById('rcTime').textContent = tStr+(fallback?' ≈':'');
      document.getElementById('rcRate').textContent = inr(activeRate)+'/km';
      document.getElementById('rcDistLabel').textContent = `(${dStr} km${isRT?' RT':''})`;
      document.getElementById('rcBase').textContent = inr(baseFare);
      document.getElementById('rcBata').textContent = inr(activeBata);
      document.getElementById('rcTotal').textContent = inr(total);
      document.getElementById('rcFareBreakdown').style.display = 'flex';
      if (rcRouteLayer)   { rcMap.removeLayer(rcRouteLayer);   rcRouteLayer=null; }
      if (rcPickupMarker) { rcMap.removeLayer(rcPickupMarker); rcPickupMarker=null; }
      if (rcDropMarker)   { rcMap.removeLayer(rcDropMarker);   rcDropMarker=null; }
      rcPickupMarker = L.marker([from.lat,from.lon],{icon:dot('#22c55e')}).bindPopup(`<b>Pickup:</b> ${pickup}`).addTo(rcMap);
      rcDropMarker   = L.marker([to.lat,to.lon],    {icon:dot('#ef4444')}).bindPopup(`<b>Drop:</b> ${drop}`).addTo(rcMap);
      if (route.geometry) {
        rcRouteLayer = L.geoJSON(route.geometry,{style:{color:'#F5B800',weight:5,opacity:0.85}}).addTo(rcMap);
        rcMap.fitBounds(rcRouteLayer.getBounds(),{padding:[30,30]});
      } else {
        rcRouteLayer = L.polyline([[from.lat,from.lon],[to.lat,to.lon]],{color:'#F5B800',weight:4,dashArray:'10 8',opacity:0.7}).addTo(rcMap);
        rcMap.fitBounds([[from.lat,from.lon],[to.lat,to.lon]],{padding:[40,40]});
      }
      setTimeout(() => rcMap.invalidateSize(), 100);
      const addMsg = document.getElementById('rcAddMsg');
      document.getElementById('rcBookBtn').onclick = function () {
        const extra = addMsg ? addMsg.value.trim() : '';
        const msg = encodeURIComponent(`Hello Sundari Travels,\n\nRoute: ${pickup} → ${drop}\nTrip: ${isRT?'Round Trip':'One Way'}\nVehicle: ${activeVehicle}\nDistance: ${dStr} km\nRate: ${inr(activeRate)}/km\nBase Fare: ${inr(baseFare)}\nDriver Bata: ${inr(activeBata)}\nEstimated Total: ${inr(total)}${extra?'\nMessage: '+extra:''}\n\nPlease confirm my booking.`);
        window.open(`https://wa.me/916385700864?text=${msg}`,'_blank','noopener');
      };
    } catch (err) {
      alert('Could not calculate route. Please check location names.\n\n'+err.message);
    } finally {
      btn.disabled=false; btn.innerHTML='<i class="fas fa-route"></i> Calculate Route';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.rc-vtab').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.rc-vtab').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        activeRate=parseInt(this.dataset.rate); activeBase=parseInt(this.dataset.base);
        activeBata=parseInt(this.dataset.bata);
        activeVehicle=this.dataset.vehicle.charAt(0).toUpperCase()+this.dataset.vehicle.slice(1);
      });
    });
    const calcBtn = document.getElementById('rcCalcBtn');
    if (calcBtn) calcBtn.addEventListener('click', calculateRoute);
    const section = document.getElementById('route-calculator');
    if (section && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver(e=>{if(e[0].isIntersecting){initRCMap();obs.disconnect();}},{threshold:0.1});
      obs.observe(section);
    } else { initRCMap(); }
    setupNominatimAC('rcPickup','rcPickupList');
    setupNominatimAC('rcDrop',  'rcDropList');
  });

})();