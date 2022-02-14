<script>
  import { onDestroy } from "svelte";

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

  const time = {
    hour: 0,
    minute: 0,
  };

  export let gradient;

  const updateTimeInterval = setInterval(() => {
    const today = new Date();
    time.hour = today.getHours();
    time.minute = today.getMinutes();
    gradient = getColorGradient(time);
  }, 100);

  function getColorBlend(startColor, endColor, distance) {
    const blendedColor = {};
    for (const part of ["r", "g", "b"]) {
      const start = startColor[part];
      const end = endColor[part];
      blendedColor[part] = Math.round(start + (end - start) * distance);
    }
    return blendedColor;
  }

  function getColorGradient({ hour, minute }) {
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
    if (startColorIdx * numSegements >= 18) {
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

  onDestroy(() => {
    clearInterval(updateTimeInterval);
  });
</script>

{#if gradient}
  <div
    class="color"
    style="
      background: linear-gradient(
        180deg,
        rgb({`${Object.values(gradient.start).join(',')}`}),
        rgb({`${Object.values(gradient.end).join(',')}`})
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
    background: var(--color-bg-default);
  }
</style>