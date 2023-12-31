<script>
  import { onMount, onDestroy } from "svelte";
  import { store, fetchWeather, gradient, isDataFetched } from "../store";

  const HOURS_IN_DAY = 24;
  const MINUTES_IN_HOUR = 60;
  const TIME_COLORS = [
    { r: 4, g: 10, b: 30 },
    { r: 139, g: 152, b: 206 },
    { r: 86, g: 216, b: 255 },
    { r: 255, g: 216, b: 116 },
    { r: 255, g: 183, b: 116 },
    { r: 255, g: 153, b: 116 },
    { r: 255, g: 103, b: 116 },
    { r: 20, g: 40, b: 116 },
  ];
  const SUNRISE_COLOR_IDX = 2;
  const SUNSET_COLOR_IDX = 6;

  let updateTimeInterval;

  function getColorBlend(startColor, endColor, distance) {
    const blendedColor = {};
    for (const part of ["r", "g", "b"]) {
      const start = startColor[part];
      const end = endColor[part];
      blendedColor[part] = Math.round(start + (end - start) * distance);
    }
    return blendedColor;
  }

  function isSameDate(a, b) {
    return a.getDate() === b.getDate();
  }

  async function getRealisticColorGradient() {
    const date = new Date();
    const now = date.getTime();
    const shiftBy = 1 * 60 * 60 * 1000; // 1 hour
    let hourAgoIsh = new Date(now - shiftBy);
    if (!isSameDate(hourAgoIsh, date)) {
      hourAgoIsh = new Date(now);
      hourAgoIsh.setHours(0, 0, 0, 0);
      await fetchWeather($store);
    }
    const gradientStart = getRealisticColor(hourAgoIsh);
    const gradientEnd = getRealisticColor(now);

    let gradient;

    if (now >= $store.weather.sunset) {
      gradient = {
        start: gradientEnd,
        end: gradientStart,
      };
    } else {
      gradient = {
        start: gradientStart,
        end: gradientEnd,
      };
    }

    return gradient;
  }

  function getRealisticColor(now) {
    const sunriseTime = $store.weather.sunrise;
    const sunsetTime = $store.weather.sunset;

    let colorPhase, phaseStartTime, phaseEndTime;
    if (now < sunriseTime) {
      const midnight = new Date(now);
      midnight.setHours(0, 0, 0, 0);
      colorPhase = TIME_COLORS.slice(0, SUNRISE_COLOR_IDX + 1);
      phaseStartTime = midnight.getTime();
      phaseEndTime = sunriseTime;
    } else if (now >= sunsetTime) {
      const EOD = new Date(now);
      EOD.setHours(23, 59, 59, 999);
      colorPhase = TIME_COLORS.slice(SUNSET_COLOR_IDX);
      colorPhase.push(TIME_COLORS[0]);
      phaseStartTime = sunsetTime;
      phaseEndTime = EOD.getTime();

      const ifValidStart = isSameDate(new Date(phaseStartTime), EOD);
      if (!ifValidStart) {
        phaseStartTime += 24 * 60 * 60 * 1000;
      }
    } else {
      colorPhase = TIME_COLORS.slice(SUNRISE_COLOR_IDX, SUNSET_COLOR_IDX + 1);
      phaseStartTime = sunriseTime;
      phaseEndTime = sunsetTime;
    }

    const timeSinceStart = now - phaseStartTime;
    const timeInPhase = phaseEndTime - phaseStartTime;
    const distance = timeSinceStart / timeInPhase;
    const phaseSegments = timeInPhase / (colorPhase.length - 1);
    const startColorIdx = Math.floor((colorPhase.length - 1) * distance);
    const endColorIdx = startColorIdx + 1;
    const startColorTime = phaseStartTime + startColorIdx * phaseSegments;
    const endColorTime = phaseStartTime + endColorIdx * phaseSegments;
    const timeInSegment = endColorTime - startColorTime;
    const timeSinceSegmentStart = now - startColorTime;
    const distanceInSegment = timeSinceSegmentStart / timeInSegment;
    const startColor = colorPhase[startColorIdx];
    const endColor = colorPhase[endColorIdx];

    const color = getColorBlend(startColor, endColor, distanceInSegment);
    return color;
  }

  function getColorGradient() {
    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const numSegements = HOURS_IN_DAY / TIME_COLORS.length;
    const startColorIdx = Math.floor(hour / numSegements);
    const endColorIdx =
      startColorIdx + 1 < TIME_COLORS.length ? startColorIdx + 1 : 0;

    const timeInMins = hour * MINUTES_IN_HOUR + minute;
    const startColor = TIME_COLORS[startColorIdx];
    const endColor = TIME_COLORS[endColorIdx];
    const colorStartTimeInMins = startColorIdx * numSegements * MINUTES_IN_HOUR;
    const colorEndTimeInMins =
      endColorIdx === 0
        ? HOURS_IN_DAY * MINUTES_IN_HOUR
        : endColorIdx * numSegements * MINUTES_IN_HOUR;
    const minSinceColorStart = timeInMins - colorStartTimeInMins;
    const minsInColorRange = Math.abs(
      colorEndTimeInMins - colorStartTimeInMins
    );
    const gradientStartDistance =
      minSinceColorStart - 60 >= 0
        ? (minSinceColorStart - 60) / minsInColorRange
        : 0;
    const gradientStart = getColorBlend(
      startColor,
      endColor,
      gradientStartDistance
    );
    const gradientEndDistance = minSinceColorStart / minsInColorRange;
    const gradientEnd = getColorBlend(
      startColor,
      endColor,
      gradientEndDistance
    );

    let gradient;
    // gradient goes "in reverse" during sunset / late night
    // so that the brightest colors are at the bottom (closer to the horizon)
    if (startColorIdx >= SUNSET_COLOR_IDX) {
      gradient = {
        start: gradientEnd,
        end: gradientStart,
      };
    } else {
      gradient = {
        start: gradientStart,
        end: gradientEnd,
      };
    }

    return gradient;
  }

  async function updateGradient() {
    let newGradient;
    if ($isDataFetched) {
      newGradient = await getRealisticColorGradient();
    } else {
      newGradient = getColorGradient();
    }
    gradient.set(newGradient);
  }

  store.subscribe(updateGradient);
  isDataFetched.subscribe(updateGradient);

  onMount(() => {
    const updateEvery = 15 * 60 * 1000; // 15 minutes
    updateTimeInterval = setInterval(updateGradient, updateEvery);
    updateGradient();
  });

  onDestroy(() => {
    clearInterval(updateTimeInterval);
  });
</script>

{#if $gradient.start}
  <div
    class="color"
    style="
      background: linear-gradient(
        180deg,
        rgb({`${Object.values($gradient.start).join(',')}`}),
        rgb({`${Object.values($gradient.end).join(',')}`})
      )
    "
  />
{/if}

<style lang="scss">
  .color {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--window-color);
  }
</style>
