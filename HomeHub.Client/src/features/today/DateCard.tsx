import * as stylex from '@stylexjs/stylex';
import type { Weather } from '../../api/hooks/useWeather';
import { formatLongDate, formatTime } from '../../lib/format';
import { colors, fonts, radius } from '../../styles/tokens.stylex';
import { WeatherBlock } from '../weather/WeatherBlock';

const styles = stylex.create({
  dateCard: {
    position: 'relative',
    overflow: 'hidden',
    padding: 'clamp(14px, 2.1vh, 22px)',
    '@media (min-width: 901px) and (max-height: 880px)': { padding: '14px' },
    borderRadius: radius.xl,
    backgroundColor: colors.accentWash,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.accentSoft,
  },
  dateGlow: {
    position: 'absolute',
    right: '-28px',
    top: '-38px',
    width: '130px',
    height: '130px',
    borderRadius: radius.pill,
    backgroundColor: 'rgba(201, 100, 66, 0.1)',
  },
  dateWeekday: {
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: colors.accentInk,
  },
  dateDay: {
    fontFamily: fonts.display,
    fontSize: 'clamp(40px, 5.2vh, 62px)',
    fontWeight: 430,
    lineHeight: 0.95,
    letterSpacing: '-0.05em',
    color: colors.ink,
    marginBlock: '6px 2px',
    '@media (min-width: 901px) and (max-height: 880px)': {
      fontSize: '38px',
      marginBlock: '4px 2px',
    },
  },
  dateMonth: {
    fontFamily: fonts.display,
    fontSize: '18px',
    fontStyle: 'italic',
    fontWeight: 420,
    color: colors.inkSoft,
  },
  dateRule: {
    height: '1px',
    backgroundColor: colors.accentSoft,
    marginBlock: 'clamp(8px, 1.2vh, 16px)',
    '@media (min-width: 901px) and (max-height: 880px)': { marginBlock: '8px' },
  },
  dateCounts: { display: 'flex', gap: '22px' },
  countValue: {
    fontFamily: fonts.sans,
    fontSize: '17px',
    fontWeight: 650,
    color: colors.ink,
    fontVariantNumeric: 'tabular-nums',
  },
  countLabel: {
    display: 'block',
    fontFamily: fonts.sans,
    fontSize: '10.5px',
    color: colors.inkMuted,
    marginTop: '1px',
  },
});

export function DateCard({
  now,
  weather,
  eventCount,
  openTaskCount,
  sx,
}: {
  now: Date;
  weather?: Weather | null;
  eventCount: number;
  openTaskCount: number;
  sx?: stylex.StyleXStyles;
}) {
  return (
    <div {...stylex.props(styles.dateCard, sx)}>
      <div {...stylex.props(styles.dateGlow)} />
      <span {...stylex.props(styles.dateWeekday)}>{formatLongDate(now).split(',')[0]}</span>
      <div {...stylex.props(styles.dateDay)}>{now.getDate()}</div>
      <span {...stylex.props(styles.dateMonth)}>
        {now.toLocaleDateString([], { month: 'long', year: 'numeric' })}
      </span>
      {weather && <WeatherBlock weather={weather} />}
      <div {...stylex.props(styles.dateRule)} />
      <div {...stylex.props(styles.dateCounts)}>
        <div>
          <span {...stylex.props(styles.countValue)}>{eventCount}</span>
          <span {...stylex.props(styles.countLabel)}>events</span>
        </div>
        <div>
          <span {...stylex.props(styles.countValue)}>{openTaskCount}</span>
          <span {...stylex.props(styles.countLabel)}>open tasks</span>
        </div>
        <div>
          <span {...stylex.props(styles.countValue)}>{formatTime(now)}</span>
          <span {...stylex.props(styles.countLabel)}>right now</span>
        </div>
      </div>
    </div>
  );
}
