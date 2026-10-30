import * as stylex from '@stylexjs/stylex';
import {
  ChevronDown,
  CloudRain,
  Droplets,
  MapPin,
  Moon,
  Sunrise,
  Sunset,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import type { Weather } from '../../api/hooks/useWeather';
import { colors, fonts, motion, radius, shadow } from '../../styles/tokens.stylex';

const GRAPH_WIDTH = 300;
const GRAPH_HEIGHT = 52;
const GRAPH_PAD = 5;

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(4px, 0.8vh, 9px)',
    marginTop: '14px',
    '@media (min-width: 901px) and (max-height: 880px)': { gap: '4px', marginTop: '10px' },
  },
  location: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: fonts.sans,
    fontSize: '10px',
    fontWeight: 650,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: colors.accentInk,
  },
  current: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '9px',
  },
  currentMain: { display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 },
  icon: { width: '36px', height: '36px', flexShrink: 0 },
  temp: {
    fontFamily: fonts.display,
    fontSize: '30px',
    fontWeight: 460,
    letterSpacing: '-0.03em',
    lineHeight: 1,
    color: colors.ink,
  },
  condition: {
    minWidth: 0,
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    lineHeight: 1.4,
    color: colors.inkMuted,
  },
  feels: {
    display: 'block',
    fontSize: '11px',
    color: colors.inkFaint,
  },
  toggle: {
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    width: '26px',
    height: '26px',
    padding: 0,
    borderWidth: 0,
    borderRadius: radius.pill,
    backgroundColor: 'transparent',
    color: colors.inkMuted,
    cursor: 'pointer',
    transitionProperty: 'color, background-color',
    transitionDuration: motion.fast,
    ':hover': { color: colors.accentInk, backgroundColor: colors.accentSoft },
    ':focus-visible': { outline: 'none', boxShadow: shadow.ring },
  },
  chevron: {
    flexShrink: 0,
    transitionProperty: 'transform',
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.ease,
  },
  chevronOpen: { transform: 'rotate(180deg)' },
  graph: {
    display: 'block',
    width: '100%',
    height: 'clamp(32px, 4.6vh, 52px)',
    '@media (min-width: 901px) and (max-height: 880px)': { height: '30px' },
  },
  graphArea: { fill: colors.accentSoft, fillOpacity: 0.7 },
  graphLine: {
    fill: 'none',
    stroke: colors.accent,
    strokeWidth: 1.5,
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
  },
  nowLine: {
    stroke: colors.accentInk,
    strokeWidth: 1,
    strokeDasharray: '2 3',
    opacity: 0.6,
  },
  rangeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: fonts.sans,
    fontSize: '11.5px',
    fontWeight: 600,
    color: colors.inkMuted,
    marginBottom: '4px',
  },
  facts: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 'clamp(4px, 0.9vh, 10px) 12px',
    marginTop: '2px',
    '@media (min-width: 901px) and (max-height: 880px)': { gap: '4px 12px' },
  },
  fact: { display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 },
  factLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: fonts.sans,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: colors.inkFaint,
    marginBottom: '4px',
  },
  factValue: {
    fontFamily: fonts.sans,
    fontSize: '12.5px',
    fontWeight: 550,
    lineHeight: 1.25,
    color: colors.inkSoft,
  },
  advice: {
    margin: '8px 0 4px',
    fontFamily: fonts.display,
    fontSize: '13.5px',
    fontStyle: 'italic',
    lineHeight: 1.4,
    color: colors.inkSoft,
    textWrap: 'balance',
    position: 'relative',
    paddingLeft: '12px',
    '::before': {
      content: '""',
      position: 'absolute',
      top: '0',
      left: '0',
      width: '1px',
      height: '20px',
      backgroundColor: colors.accent,
    },
  },
});

function adviceFor(weather: Weather): string {
  if (weather.temperatureC <= 4) return 'Wrap up warm — it is properly cold out.';
  if (weather.chanceOfRain >= 60) return 'Take an umbrella — rain is likely today.';
  if (weather.windKph >= 35) return 'Hold onto your hat — it is windy out there.';
  if (weather.temperatureC <= 12) return 'Take a coat — it is a chilly one.';
  if (weather.temperatureC >= 28) return 'Find some shade — it is a hot one.';
  return 'A good day to be out and about.';
}

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div {...stylex.props(styles.fact)}>
      <span {...stylex.props(styles.factLabel)}>
        <Icon size={11} strokeWidth={2} />
        {label}
      </span>
      <span {...stylex.props(styles.factValue)}>{value}</span>
    </div>
  );
}

export function WeatherBlock({ weather }: { weather: Weather }) {
  // Desktop shows the details by default; their sizes shrink with the viewport
  // height so the dashboard still fits without scrolling.
  const [expanded, setExpanded] = useState(() => window.matchMedia('(min-width: 901px)').matches);

  if (!Array.isArray(weather.hourly)) return null;

  const temperatures = weather.hourly.map((hour) => hour.temperatureC);
  const low = temperatures.length > 0 ? Math.min(...temperatures) : weather.lowC;
  const high = temperatures.length > 0 ? Math.max(...temperatures) : weather.highC;
  const span = high - low || 1;
  const points = temperatures
    .map((temperature, index) => {
      const x =
        temperatures.length > 1
          ? (index / (temperatures.length - 1)) * GRAPH_WIDTH
          : GRAPH_WIDTH / 2;
      const y =
        GRAPH_HEIGHT - GRAPH_PAD - ((temperature - low) / span) * (GRAPH_HEIGHT - GRAPH_PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const areaPoints = `0,${GRAPH_HEIGHT} ${points} ${GRAPH_WIDTH},${GRAPH_HEIGHT}`;
  const now = new Date();
  const nowFraction = Math.min(
    1,
    Math.max(0, (now.getHours() + now.getMinutes() / 60) / (temperatures.length - 1)),
  );
  const nowX = Math.min(GRAPH_WIDTH - 0.5, Math.max(0.5, nowFraction * GRAPH_WIDTH));
  const iconUrl = weather.iconUrl.startsWith('//') ? `https:${weather.iconUrl}` : weather.iconUrl;

  return (
    <div {...stylex.props(styles.root)}>
      <span {...stylex.props(styles.location)}>
        <MapPin size={11} strokeWidth={2} />
        {weather.location}
      </span>

      <div {...stylex.props(styles.current)}>
        <div {...stylex.props(styles.currentMain)}>
          {iconUrl && (
            <img {...stylex.props(styles.icon)} src={iconUrl} alt="" width={36} height={36} />
          )}
          <span {...stylex.props(styles.temp)}>{Math.round(weather.temperatureC)}°</span>
          <span {...stylex.props(styles.condition)}>
            {weather.condition}
            <span {...stylex.props(styles.feels)}>
              Feels like {Math.round(weather.feelsLikeC)}°
            </span>
          </span>
        </div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? 'Hide weather details' : 'Show weather details'}
          onClick={() => setExpanded((open) => !open)}
          {...stylex.props(styles.toggle)}
        >
          <ChevronDown
            size={15}
            strokeWidth={2}
            {...stylex.props(styles.chevron, expanded && styles.chevronOpen)}
          />
        </button>
      </div>

      {expanded && (
        <>
          {temperatures.length > 1 && (
            <svg
              {...stylex.props(styles.graph)}
              viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
              preserveAspectRatio="none"
              role="img"
              aria-label={`Hourly temperatures today, from ${Math.round(low)} to ${Math.round(high)} degrees`}
            >
              <polygon points={areaPoints} {...stylex.props(styles.graphArea)} />
              <line
                x1={nowX}
                y1={0}
                x2={nowX}
                y2={GRAPH_HEIGHT}
                vectorEffect="non-scaling-stroke"
                {...stylex.props(styles.nowLine)}
              />
              <polyline
                points={points}
                vectorEffect="non-scaling-stroke"
                {...stylex.props(styles.graphLine)}
              />
            </svg>
          )}

          <div {...stylex.props(styles.rangeRow)}>
            <span>Low {Math.round(low)}°</span>
            <span>High {Math.round(high)}°</span>
          </div>

          <div {...stylex.props(styles.facts)}>
            <Fact icon={CloudRain} label="Rain" value={`${weather.chanceOfRain}%`} />
            <Fact icon={Wind} label="Wind" value={`${Math.round(weather.windKph)} km/h`} />
            <Fact icon={Droplets} label="Humidity" value={`${weather.humidity}%`} />
            <Fact icon={Sunrise} label="Sunrise" value={weather.sunrise} />
            <Fact icon={Sunset} label="Sunset" value={weather.sunset} />
            <Fact
              icon={Moon}
              label="Moon"
              value={`${weather.moonPhase} · ${weather.moonIllumination}%`}
            />
          </div>

          <p {...stylex.props(styles.advice)}>{adviceFor(weather)}</p>
        </>
      )}
    </div>
  );
}
