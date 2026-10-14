(() => {
  'use strict';
  const config=window.SITE_DATA?.site.weather;
  const button=document.getElementById('weather');
  const credit=document.getElementById('weatherCredit');
  if(!config?.enabled||!button)return;
  button.hidden=false;
  credit.hidden=false;
  const interval=Math.max(5,Number(config.refreshMinutes)||15)*60000;
  let point={latitude:config.latitude,longitude:config.longitude,label:config.defaultLabel||'SEOUL'};
  let timer,busy=false,request=0;
  const describe=(code,day)=>{
    if(code===0)return [day?'☀':'☾','Clear'];
    if(code<=3)return ['☁',code===3?'Overcast':'Partly cloudy'];
    if(code<=48)return ['≋','Fog'];
    if(code<=57)return ['☂','Drizzle'];
    if(code<=67)return ['☂','Rain'];
    if(code<=77)return ['❄','Snow'];
    if(code<=82)return ['☂','Rain showers'];
    if(code<=86)return ['❄','Snow showers'];
    return ['ϟ','Thunderstorm'];
  };
  async function update(){
    const current=++request;
    clearTimeout(timer);
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),10000);
    button.setAttribute('aria-busy','true');
    try{
      const url=new URL('https://api.open-meteo.com/v1/forecast');
      // Round to ~1 km; coordinates are used for this request only, never stored.
      url.search=new URLSearchParams({latitude:Number(point.latitude).toFixed(2),longitude:Number(point.longitude).toFixed(2),current:'temperature_2m,weather_code,is_day',temperature_unit:'celsius',forecast_days:'1',timezone:'auto'}).toString();
      const response=await fetch(url,{signal:controller.signal,referrerPolicy:'no-referrer'});
      if(!response.ok)throw Error('Weather unavailable');
      const data=await response.json();
      const weather=data.current;
      if(!weather||typeof weather.temperature_2m!=='number'||!Number.isFinite(weather.temperature_2m)||typeof weather.weather_code!=='number')throw Error('Invalid weather response');
      if(current!==request)return;
      const [icon,condition]=describe(weather.weather_code,weather.is_day);
      button.textContent=`${point.label==='LOCAL'?'LOCAL ':''}${icon} ${Math.round(weather.temperature_2m)}°C`;
      button.title=`${point.label}: ${condition}. Use current location (approximate coordinates sent to Open-Meteo).`;
      button.setAttribute('aria-label',`${point.label} weather: ${condition}, ${Math.round(weather.temperature_2m)} degrees Celsius. Use current location.`);
    }catch{
      if(current!==request)return;
      button.textContent='WEATHER —';
      button.title='Weather unavailable. Click to try your current location.';
      button.setAttribute('aria-label','Weather unavailable. Try current location.');
    }finally{
      clearTimeout(timeout);
      if(current===request){button.removeAttribute('aria-busy');timer=setTimeout(update,interval);}
    }
  }
  button.addEventListener('click',()=>{
    if(busy)return;
    if(!window.isSecureContext||!navigator.geolocation){
      button.title='Location requires HTTPS and browser support. Showing default location.';
      return;
    }
    busy=true;
    button.disabled=true;
    button.setAttribute('aria-busy','true');
    navigator.geolocation.getCurrentPosition(position=>{
      busy=false;button.disabled=false;
      point={latitude:position.coords.latitude,longitude:position.coords.longitude,label:'LOCAL'};
      update();
    },error=>{
      busy=false;button.disabled=false;button.removeAttribute('aria-busy');
      button.title=error.code===1?'Location permission denied. Using the displayed location.':'Location unavailable. Using the displayed location.';
    },{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
  });
  window.addEventListener('pagehide',()=>{clearTimeout(timer);request++;});
  window.addEventListener('pageshow',event=>{if(event.persisted)update();});
  update();
})();
