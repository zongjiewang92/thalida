<script>
  import { store } from "../store";

  export let icon;
  export const weatherVisibility = {
    cloudSm: false,
    cloudMd: false,
    cloudLg: false,
    lightRain: false,
    rain: false,
    thunderstorm: false,
    snow: false,
    mist: false,
    showDroplets: false,
  };
  export const iconWeatherMap = {
    "02d": ["cloudSm"],
    "02n": ["cloudSm"],
    "03d": ["cloudSm", "cloudMd"],
    "03n": ["cloudSm", "cloudMd"],
    "04d": ["cloudSm", "cloudMd", "cloudLg"],
    "04n": ["cloudSm", "cloudMd", "cloudLg"],
    "09d": ["cloudMd", "lightRain"],
    "09n": ["cloudMd", "lightRain"],
    "10d": ["cloudMd", "cloudLg", "rain"],
    "10n": ["cloudMd", "cloudLg", "rain"],
    "11d": ["cloudSm", "cloudMd", "cloudLg", "thunderstorm"],
    "11n": ["cloudSm", "cloudMd", "cloudLg", "thunderstorm"],
    "13d": ["snow"],
    "13n": ["snow"],
    "50d": ["mist"],
    "50n": ["mist"],
  };

  store.subscribe(() => {
    icon = null;
    if (
      typeof $store.weather.current !== "undefined" &&
      $store.weather.current !== null
    ) {
      icon = $store.weather.current.icon;
    }
    const iconWeather = iconWeatherMap[icon];
    for (const weather of Object.keys(weatherVisibility)) {
      weatherVisibility[weather] = iconWeather
        ? iconWeather.includes(weather)
        : false;
    }

    weatherVisibility.showDroplets =
      weatherVisibility.lightRain ||
      weatherVisibility.rain ||
      weatherVisibility.thunderstorm ||
      weatherVisibility.snow;
  });
</script>

<div class="weather weather-{icon}">
  {#if weatherVisibility.cloudLg}
    <div class="cloud cloud-lg" />
  {/if}
  {#if weatherVisibility.cloudMd}
    <div class="cloud cloud-md" />
  {/if}
  {#if weatherVisibility.thunderstorm}
    <div class="lightning" />
  {/if}
  {#if weatherVisibility.cloudSm}
    <div class="cloud cloud-sm" />
  {/if}
  {#if weatherVisibility.mist}
    <div class="mist mist-lg" />
    <div class="mist mist-md" />
    <div class="mist mist-sm" />
  {/if}
  {#if weatherVisibility.showDroplets}
    <div class="droplets">
      {#each new Array(6) as _, i}
        <div class="droplet-row droplet-row-{i + 1}">
          {#each new Array(6) as _, j}
            <div class="droplet droplet-{j + 1}" />
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .weather {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .cloud {
      display: block;
      position: absolute;
      background: #fff;

      &.cloud-sm {
        width: 45px;
        height: 45px;
        top: 55%;
        left: 10%;
        border-radius: 50% 50% 0 50%;
        transform: translate(0, 0);
        animation: 4s ease-in-out infinite alternate cloud-sm-hover;

        @keyframes cloud-sm-hover {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(5px, 5px);
          }
        }

        &:after {
          content: "";
          display: block;
          position: absolute;
          width: 50%;
          height: 55%;
          border-radius: 50% 50% 50% 0;
          background: #fff;
          bottom: 0;
          right: -45%;
        }
      }

      &.cloud-md {
        width: 60px;
        height: 60px;
        top: 65%;
        right: 20%;
        border-radius: 40% 50% 0 0;
        transform: translate(0, 0);
        animation: 6s ease-in-out infinite alternate cloud-md-hover;

        @keyframes cloud-md-hover {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(0, -10px);
          }
        }

        &:before,
        &:after {
          content: "";
          display: block;
          position: absolute;
          background: #fff;
          bottom: 0;
        }

        &:before {
          width: 60%;
          height: 70%;
          left: -50%;
          border-radius: 40% 50% 0 50%;
        }

        &:after {
          width: 50%;
          height: 55%;
          right: -45%;
          border-radius: 30% 50% 50% 0;
        }
      }

      &.cloud-lg {
        width: 90px;
        height: 90px;
        top: 5%;
        right: 10%;
        border-radius: 30% 50% 0 50%;
        transform: translate(0, 0);
        animation: 8s ease-in-out infinite alternate cloud-md-hover;

        @keyframes cloud-md-hover {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(-20px, 10px);
          }
        }

        &:after {
          content: "";
          display: block;
          position: absolute;
          background: #fff;
          bottom: 0;
        }

        &:after {
          width: 50%;
          height: 75%;
          right: -45%;
          border-radius: 30% 50% 50% 0;
        }
      }
    }

    .droplets {
      display: flex;
      flex-flow: column nowrap;
      justify-content: space-evenly;
      width: 150%;
      height: 150%;
      transform: rotateZ(-45deg) translate(0%, -50%);
      animation-timing-function: linear;
      animation-iteration-count: infinite;
      animation-name: precipitate;

      @keyframes precipitate {
        0% {
          transform: rotateZ(-45deg) translate(0%, -50%);
        }
        100% {
          transform: rotateZ(-45deg) translate(0%, 43%);
        }
      }

      .droplet-row {
        width: 100%;
        display: flex;
        flex-flow: row wrap;
        justify-content: space-evenly;
        margin: 5% 0;
      }

      .droplet {
        display: block;
        flex-shrink: 0;
        @for $i from 1 through 6 {
          &.droplet-#{$i} {
            margin: (1% * $i) 10%;
          }
        }
      }
    }

    .lightning {
      position: absolute;
      top: 60px;
      left: 50%;
      width: 50px;
      height: 5px;
      background: yellow;
      border-radius: 10px;
      animation: 2s linear infinite flash;

      @keyframes flash {
        0% {
          opacity: 1;
        }
        10% {
          opacity: 0;
        }
        60% {
          opacity: 1;
        }
      }

      &:before,
      &:after {
        content: "";
        position: absolute;
        width: 5px;
        background: yellow;
        border-radius: 10px;
      }

      &:before {
        height: 100px;
        top: -94px;
        left: -2px;
        transform: rotateZ(35deg);
        transform-origin: bottom right;
      }

      &:after {
        height: 200px;
        top: -1px;
        right: -4px;
        transform: rotateZ(35deg);
        transform-origin: top left;
      }
    }

    .mist {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 120%;
      animation: 5s linear infinite alternate mist-roll;
      transform: translate(0, 0);

      &.mist-lg {
        height: 45%;
        opacity: 0.1;
        background: rgb(128, 128, 128);
        box-shadow: 0 -10px 20px 10px rgb(128, 128, 128);
      }

      &.mist-md {
        height: 20%;
        opacity: 0.2;
        background: rgb(128, 128, 128);
        box-shadow: 0 -10px 40px 30px rgb(128, 128, 128);
      }

      &.mist-sm {
        height: 0;
        opacity: 0.4;
        box-shadow: 0 -10px 30px 20px rgb(128, 128, 128);
      }

      @keyframes mist-roll {
        0% {
          transform: translate(-20%, 0%);
        }
        100% {
          transform: translate(0%, 20%);
        }
      }
    }

    &.weather-09d,
    &.weather-09n {
      .cloud {
        top: 50%;
        right: 20%;
      }

      .droplets {
        animation-duration: 6s;

        .droplet {
          width: 3px;
          height: 9px;
          background: #28afff;
          border-radius: 3px;
          opacity: 0.7;
        }
      }
    }

    &.weather-10d,
    &.weather-10n {
      .cloud-md {
        top: 40%;
        left: 10%;
        right: unset;
      }

      .droplets {
        animation-duration: 2s;

        .droplet {
          width: 4px;
          height: 9px;
          background: #28afff;
          border-radius: 3px;
        }
      }
    }

    &.weather-11d,
    &.weather-11n {
      .cloud,
      .cloud:before,
      .cloud:after {
        background: rgb(69, 69, 69);
      }
      .cloud-sm {
        top: 20%;
        left: 35%;
        right: unset;
      }
      .cloud-md {
        top: 5%;
        left: 80%;
        right: unset;
      }
      .cloud-lg {
        top: -10%;
        left: 10%;
        right: unset;
      }

      .droplets {
        animation-duration: 3s;
        .droplet {
          width: 4px;
          height: 9px;
          background: #28afff;
          border-radius: 3px;
        }
      }
    }

    &.weather-13d,
    &.weather-13n {
      .droplets {
        animation-duration: 3s;

        .droplet {
          width: 6px;
          height: 6px;
          background: #fff;
          border-radius: 50%;
        }
      }
    }
  }
</style>
