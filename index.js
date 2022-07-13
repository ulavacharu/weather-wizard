let userLocation,extendedLocation,lat,long;
let error=document.getElementById('display-error');
function getLoc( ) {
    error.style.visibility="hidden";
    userLocation=document.getElementById("user-location").value;
    positionFunc();
}
function customLoc(temp) {
    error.style.visibility="hidden";
    userLocation=temp;
    positionFunc(); 
}

async function positionFunc() {
    try
    {   
        let position_clientID=process.env.pos_stack_key;
        const position_endpoint=`/api/forward?access_key=${position_clientID}&query=${userLocation}`;
        const response = await fetch(position_endpoint);
        const jsonData =await response.json();
        console.log(jsonData);
        userLocation=jsonData.data[0].name;
        extendedLocation=` , ${jsonData.data[0].region_code}, ${jsonData.data[0].country_code}`; 
        long = jsonData.data[0].longitude;
        lat=jsonData.data[0].latitude; 
        openWeather();
    }catch(e) {
        error.style.visibility="visible";
        error.innerText="Error Occured while fetching geo Location & Error is "+e;
    }
}
async function openWeather() {
    try {    
        let open_clientID=process.env.open_key;
        const res= await fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${long}&appid=${open_clientID}`)
        const wData= await res.json();
        $('html, body').animate({ scrollTop: 0 }, 'fast');

        final(wData);
    }catch(e) {
        error.style.visibility="visible";
        error.innerText="Error Occured while fetching Current weather data & Error is "+e;
    }
    
}
let locElement = document.querySelector("#result-city");
let extLocElement = document.querySelector("#result-ext-city");
let tempElement = document.querySelector("#result-temp");
let descElement= document.querySelector("#result-desc");
let iconElement = document.querySelector("#result-icon");
let humidElement = document.querySelector("#result-humid");
let windElement = document.querySelector("#result-wind");   

const final = (wData) => {
    locElement.innerText=userLocation;
    extLocElement.innerText=extendedLocation;
    tempElement.innerText=wData.main.temp;
    descElement.innerText=wData.weather[0].description;
    iconElement.classList.add("final-icon");
    iconElement.src=`https://openweathermap.org/img/wn/${wData.weather[0].icon}.png`;
    humidElement.innerText=wData.main.humidity;
    windElement.innerText=wData.wind.speed;   
    weeklyOpen();
}

let weeklyData={};
let weekMaxTemperature,weekWindSpeed,weekHumidity;
async function weeklyOpen() {
    try {
        let weeklyClientId="857c0aa283617b6512bc96195a81d783";
        let weekly_endpoint=`https://api.openweathermap.org/data/2.5/onecall?units=metric&exclude=hourly,minutely,current&lat=${lat}&lon=${long}&appid=${weeklyClientId}`;
        const response = await fetch(weekly_endpoint);
        weeklyData = await response.json();
        

        let tomp= weeklyData.daily.map(x => x);//temp variable
        weekMaxTemperature =tomp.map(x=> x.temp.max);
        weekWindSpeed=tomp.map(x => x.wind_speed);
        weekWindSpeed=tomp.map(x => x.wind_speed);
        weekHumidity=tomp.map(x => x.humidity)
    }catch(e) {
        error.style.visibility="visible";
        error.innerText="Error Occured while fetching weekly data & Error is "+e;
    }
}

    

    const month = [" Jan"," Feb"," Mar"," Apr"," May"," Jun"," Jul"," Aug"," Sept"," Oct"," Nov"," Dec"];

    const date = new Date();

    let today =date.getDate();

    let name = month[date.getMonth()];
    let stlylingChart= document.getElementById('chart')

let myChart= document.getElementById('chart').getContext('2d');

function callChart() {
    if(userLocation) {
        stlylingChart.style.display="block";
        stlylingChart.style.backgroundColor="white";
        let delayed;
        let config ={
            type:'line',
            data:{
                labels :[today+name,today+1+name,today+2+name,today+3+name,today+4+name,today+5+name,today+6+name],
                datasets:[
                    {
                        label:'Max Temparature',
                        data:weekMaxTemperature,
                        backgroundColor: 'lightblue',
                        borderColor: 'royalblue',
                        tension:0.3
                    },
                    {
                        label:'Wind Speeds',
                        data:weekWindSpeed,
                        backgroundColor: 'lightpink',
                        borderColor: 'hotpink',
                        tension:0.3
                    },
                    {
                        label:'Humidity',
                        data:weekHumidity,
                        backgroundColor: 'powderblue',
                        borderColor: 'lightseagreen ',
                        tension:0.3
                    }


                ],
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                    display: true,
                    text: `Weather Forecast in ${userLocation}`,
                    font: {
                        size: 18
                    }
                    }
                },
                legend: {
                    display: true,
                    position:'bottom',
                },
                animation: {
                    onComplete: () => {
                    delayed = true;
                    },
                    delay: (context) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !delayed) {
                        delay = context.dataIndex * 300 + context.datasetIndex * 100;
                    }
                    return delay;
                    },
                },
                bezierCurve: true,
                scales: {
                    y: {
                        beginAtZero: true,
                    }
                }
                
            }
            };
        let weatherChart =new Chart(myChart, config)
    }
    else {
        error.style.visibility="visible";
        error.innerText="Invalid Location";
        error.scrollIntoView({
            behavior: 'auto',
            block: 'center',
            inline: 'center'
        });
    }

}
function updateChart() {
    let chartStatus = Chart.getChart("chart");
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }
    myChart= document.getElementById('chart').getContext('2d');
    callChart();
}
function clearEverything() {
    document.querySelector("#user-location").value="";
    locElement.innerText="-----";
    tempElement.innerText="--";
    descElement.innerText="-----";
    iconElement.classList.remove("final-icon");
    document.getElementById("result-ext-city").innerText=null;
    iconElement.src=`#`;
    humidElement.innerText="--";
    windElement.innerText="--";   
    error.visibility="hidden";
}
window.positionFunc=positionFunc;
window.customLoc = customLoc;
window.updateChart = updateChart;
window.callChart = callChart;
window.getLoc = getLoc;
window.clearEverything = clearEverything;
