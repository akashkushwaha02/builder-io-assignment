import React from "react";
import cities from "../../lib/city.list.json";
import TodaysWeather from "../../components/TodaysWeather";
import HourlyWeather from "../../components/HourlyWeather";
import WeeklyWeather from "../../components/WeeklyWeather";
import Link from "next/link";
import Head from "next/head";
import SearchBox from "../../components/SearchBox";
import moment from "moment-timezone";
import { useRouter } from "next/router";

export async function getServerSideProps(context) {
  const city = isNaN(context.params.city)
    ? getCityId(context.params.city)
    : "pune";

  if (!city) {
    return {
      notFound: true,
    };
  }

  let res;
  let data;

  if (!isNaN(context.params.city)) {
    //console.log(context.params.city, "inside server");
    res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${context.params.city}&units=imperial&appid=${process.env.REACT_APP_API_KEY}&exclude=minutely&units=metric`
    );

    data = await res.json();
    return (
      <>
        {data.sys.name}
        {data.sys.country}
      </>
    );
  } else {
    res = await fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${city.coord.lat}&lon=${city.coord.lon}&appid=${process.env.REACT_APP_API_KEY}&exclude=minutely&units=metric`
    );

    data = await res.json();
  }

  if (!data) {
    return {
      notFound: true,
    };
  }

  const hourlyWeather = getHourlyWeather(
    data?.hourly,
    (data.timezone = "Asia/Kolkata")
  );

  const weeklyWeather = data.daily;

  return {
    props: {
      city: city,
      timezone: data.timezone,
      currentWeather: data.current,
      hourlyWeather: hourlyWeather,
      weeklyWeather: weeklyWeather,
    }, // will be passed to the page component as props
  };
}

const getCityId = (param) => {
  const cityParam = param.trim();
  // get the id of the city
  const splitCity = cityParam.split("-");
  const id = splitCity[splitCity.length - 1];

  if (!id) {
    return null;
  }

  const city = cities.find((city) => city.id.toString() == id);

  if (city) {
    return city;
  } else {
    return null;
  }
};

const getHourlyWeather = (hourlyData, timezone) => {
  const endOfDay = moment().tz(timezone)?.endOf("day").valueOf();
  const eodTimeStamp = Math.floor(endOfDay / 1000);

  const todaysData = hourlyData?.filter((data) => data.dt < eodTimeStamp);

  return todaysData;
};

export default function City({
  city,
  weather,
  currentWeather,
  hourlyWeather,
  weeklyWeather,
  timezone,
}) {
  //console.log(useRouter(), "inside");
  return (
    <>
      <Head>
        <title>{city.name} Weather - Next Weather App</title>
      </Head>

      <div className="page-wrapper">
        <div className="container">
          <Link href="/">
            <a className="back-link">&larr; Home</a>
          </Link>
          <SearchBox placeholder="Search for another location..." />
          <TodaysWeather
            city={city}
            weather={weeklyWeather[0]}
            timezone={timezone}
          />
          <HourlyWeather hourlyWeather={hourlyWeather} timezone={timezone} />
          <WeeklyWeather weeklyWeather={weeklyWeather} timezone={timezone} />
        </div>
      </div>
    </>
  );
}
