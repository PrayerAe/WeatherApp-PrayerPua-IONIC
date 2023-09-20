import { useContext, useEffect, useState } from "react"
import { WeatherCard, WeatherCardError } from "./WeatherCard"
import { AppConfig } from "../SettingContext"
import { IonCol, IonGrid, IonItem, IonList, IonRow, IonSearchbar, IonText } from "@ionic/react"
import "./HomeContentContainer.css";

const kunciApi = {
    'apiKey': '0072910938a57146b8cb5dc3fafa54f7',
}

type SettingType = {
    'language': string,
    'apiKey': string,
    'metric': string,
    'user': {
        'auto_refetch': boolean,
        'fetch_interval': number
    }
}


async function cityPosition({city, setting}: {city: string | null, setting: SettingType}){
    
    if (city !== null && city !== undefined){
        let response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${setting?.apiKey}`) || []
        const json_response = await response.json()
        return json_response
    }
    return [];
}

async function cuacaSekarang({latitude, longitude, setting}: 
    {latitude: number | null, longitude: number | null, setting: SettingType}){
   
    if (latitude && longitude){
        let response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${setting.apiKey}&units=${setting.metric}&lang=${setting.language}`)
        let json_data = await response.json()
        console.log(json_data)
        return json_data
    }
}

async function cuacaJam({latitude, longitude, setting}: 
    {latitude: number | null, longitude: number | null, setting: SettingType}){
    
    let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${setting.metric}&appid=${setting.apiKey}`)
    let response_json = await response.json()
    return response_json?.list ?? []
}


export default function HomeContentContainer({setting}: {setting: SettingType}){
    const [city, setSelectedCity] = useState<string | null>('manado')
    const [hourlyWeatherkunciApi, setHourlyWeatherkunciApi] = useState<Array<{
        'dt': number, 
        'main': {
            'temp': number,
        },
        'weather': Array<{
            'id': number,
            'main': string,
            'description': string,
            'icon' : string | null
        }>
    }>>([])

    const [weatherkunciApi, setWeatherkunciApi] = useState<{
        'city': string | null,
        'latitude': number | null,
        'longitude': number | null,
        'temp': number | null,
        'weather': {
            'id': number | null,
            'main': string | null,
            'description': string | null,
            'icon': string | null
        },
        'forecast_date': number | null

    }>({
        'city': null,
        'latitude': null,
        'longitude': null,
        'temp': null,
        'weather': {
            'id': null,
            'main': null,
            'description': null,
            'icon': null
        },
        'forecast_date': null
    })

    async function dataFetching({city}: {city: string | null}){
        const city_location = await cityPosition({city: city, setting: setting})
        const weather_info_data = await cuacaSekarang({
            latitude: city_location?.[0]?.lat,
            longitude: city_location?.[0]?.lon,
            setting: setting
        })
        return {
            'city': city_location?.[0]?.name,
            'latitude': city_location?.[0]?.lat,
            'longitude': city_location?.[0]?.lon,
            'temp': weather_info_data?.main?.temp,
            'weather': weather_info_data?.weather?.[0],
            'forecast_date': weather_info_data?.dt
        }
    }

    async function dataJam({city}: {city: string | null}){
        const city_location = await cityPosition({city: city, setting: setting})
        const forecast_data_list = await cuacaJam({
            latitude: city_location?.[0]?.lat,
            longitude: city_location?.[0]?.lon,
            setting: setting
        })
        return forecast_data_list
    }

    useEffect(() => {
        console.log(`city selected: ${city}`)
        dataFetching({city: city})
        .then(res => {
            setWeatherkunciApi(res)
        })

        dataJam({city: city})
            .then( res => {
                setHourlyWeatherkunciApi(res)
            })
    }, [city, setting])

    useEffect(() => {
        if (
            (weatherkunciApi?.city !== undefined 
                || weatherkunciApi?.city !== null
            ) && setting?.user?.auto_refetch){

            // call every 5 minute
            let data_fetch_interval = setInterval(
                () => {
                    console.info("start to re-fetch data")
                    dataFetching({city: weatherkunciApi?.city})
                        .then(res =>setWeatherkunciApi(res))
                },
            setting?.user?.fetch_interval ?? 300000
            )
            return () => clearInterval(data_fetch_interval)
        }
    })

    useEffect(() => {
        console.log(weatherkunciApi)
    }, [weatherkunciApi])

    return (
        <div>
            <IonSearchbar placeholder="Cari kota disini" onIonInput={ e => setSelectedCity(e?.target?.value ?? null)}
                debounce={500}
                color="light"
            />
            
            { weatherkunciApi?.city &&
                <WeatherCard 
                    temp={weatherkunciApi?.temp} 
                    imageUrl={weatherkunciApi?.weather?.icon}
                    description={weatherkunciApi?.weather?.description} 
                    city={weatherkunciApi?.city} 
                    units={setting.metric}
                    name={weatherkunciApi?.weather?.main}
                    forecast_date={weatherkunciApi?.forecast_date}
                />
            }
            {
                weatherkunciApi?.city === undefined
                && <WeatherCardError 
                        message="Nama tempat tidak ditemukan"
                    />
                    
            }
            <IonGrid>
                {   weatherkunciApi?.city !== undefined &&
                    <IonRow>
                        <IonText color="light">
                            <h3>Prediksi Cuaca</h3>
                        </IonText>
                    </IonRow>
                }
                <IonRow className="forecast_hourly_container">
                    {hourlyWeatherkunciApi.map( weather_data => {
                        return (
                            <IonCol key={hourlyWeatherkunciApi.indexOf(weather_data)}>
                                <WeatherCard 
                                    temp={weather_data?.main.temp}
                                    city={weatherkunciApi?.city}
                                    description={weatherkunciApi?.weather?.description}
                                    units={setting?.metric}
                                    name={weather_data?.weather?.[0]?.main}
                                    imageUrl={weather_data?.weather?.[0]?.icon}
                                    forecast_date={weather_data?.dt}
                                />
                            </IonCol>
                        )
                    })}
                </IonRow>
            </IonGrid>
        </div>
    )
}