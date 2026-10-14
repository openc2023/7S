(() => {
  'use strict';
  const text=window.SITE_DATA.text.shared;
  const label=(key,values={})=>String(text[key]).replace(/\{(\w+)\}/g,(match,name)=>Object.hasOwn(values,name)?values[name]:match);
  const config=window.SITE_DATA?.site.weather;
  const button=document.getElementById('weather');
  const credit=document.getElementById('weatherCredit');
  if(!config?.enabled||!button)return;
  button.hidden=false;
  credit.hidden=false;
  const interval=Math.max(5,Number(config.refreshMinutes)||15)*60000;
  let point={latitude:config.latitude,longitude:config.longitude,label:config.defaultLabel||'BUSAN'};
  let timer,busy=false,request=0;
  const describe=(code,day)=>{
    if(code===0)return [day?'☀':'☾',label('clear')];
    if(code<=3)return ['☁',code===3?label('overcast'):label('cloudy')];
    if(code<=48)return ['≋',label('fog')];
    if(code<=57)return ['☂',label('drizzle')];
    if(code<=67)return ['☂',label('rain')];
    if(code<=77)return ['❄',label('snow')];
    if(code<=82)return ['☂',label('showers')];
    if(code<=86)return ['❄',label('snowShowers')];
    return ['ϟ',label('thunderstorm')];
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
      button.textContent=`${point.label==='LOCAL'?label('weatherLocal')+' ':''}${icon} ${Math.round(weather.temperature_2m)}°C`;
      button.title=label('weatherTitle',{location:point.label==='LOCAL'?label('weatherLocal'):point.label,condition});
      button.setAttribute('aria-label',label('weatherAria',{location:point.label==='LOCAL'?label('weatherLocal'):point.label,condition,temperature:Math.round(weather.temperature_2m)}));
    }catch{
      if(current!==request)return;
      button.textContent=label('weatherPlaceholder');
      button.title=label('weatherFailedTitle');
      button.setAttribute('aria-label',label('weatherFailedAria'));
    }finally{
      clearTimeout(timeout);
      if(current===request){button.removeAttribute('aria-busy');timer=setTimeout(update,interval);}
    }
  }
  button.addEventListener('click',()=>{
    if(busy)return;
    if(!window.isSecureContext||!navigator.geolocation){
      button.title=label('weatherInsecure');
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
      button.title=error.code===1?label('weatherDenied'):label('weatherUnavailable');
    },{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
  });
  window.addEventListener('pagehide',()=>{clearTimeout(timer);request++;});
  window.addEventListener('pageshow',event=>{if(event.persisted)update();});
  update();
})();
