<script>
  import { onMount, onDestroy } from "svelte";
  import { store, fetchWeather } from "../store";
  import LiveWindowBlinds from "./LiveWindowBlinds.svelte";
  import LiveWindowClock from "./LiveWindowClock.svelte";
  import LiveWindowSky from "./LiveWindowSky.svelte";

  let updateWeatherInterval;
  export const liveWindowStyles = {
    width: 256,
    height: 385,
    rodHeightScale: 0.75,
    blindsWidthScale: 1.4,
    collapsedSlatHeightScale: 0.05,
  };

  async function updateWeather() {
    await fetchWeather($store);
  }

  onMount(async () => {
    const updateEvery = 1 * 60 * 60 * 1000; // 1 hour
    updateWeatherInterval = setInterval(updateWeather, updateEvery);
    updateWeather();
  });

  onDestroy(() => {
    clearInterval(updateWeatherInterval);
  });
</script>

<div
  class="scene"
  style="
      --live-window-height: {`${liveWindowStyles.height}px`};
      --live-window-width: {`${liveWindowStyles.width}px`};
      --live-window-blinds-width-scale: {liveWindowStyles.blindsWidthScale};
      --live-window-collapsed-slat-height-scale: {liveWindowStyles.collapsedSlatHeightScale};
      --live-window-rod-height-scale: {liveWindowStyles.rodHeightScale};
    "
>
  <div class="live-window">
    <LiveWindowSky />
    <div class="horizontal-bar" />
    <LiveWindowBlinds />
    <LiveWindowClock />
  </div>
  {#if $store.weather.current}
    <p class="current-weather-text">
      It&rsquo;s
      {$store.weather.current.temp}&deg;C and
      {$store.weather.current.main}
    </p>
  {/if}
</div>

<style lang="scss">
  .scene {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    margin-top: 60px;
  }
  .live-window {
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    align-items: center;
    width: var(--live-window-width);
    height: var(--live-window-height);
    overflow: hidden;
    transform: translateX(0);
    border-radius: 18px;
    border: 4px solid var(--window-color);

    .horizontal-bar {
      position: absolute;
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      height: 15px;
      background: var(--window-color);
      top: calc((100% - 15px) / 2);

      &::before {
        content: "";
        position: absolute;
        top: -5px;
        width: 8%;
        height: 5px;
        border-radius: 5px 5px 0 0;
        background: var(--window-color);
      }
    }
  }
  .current-weather-text {
    font-family: var(--primary-font);
    font-size: 18px;
    width: var(--live-window-width);
    text-align: center;
    margin: 30px 0;
  }
</style>
