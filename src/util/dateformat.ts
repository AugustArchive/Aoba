// Credit: https://github.com/felixge/node-dateformat

/** Settings to format the date for UTC or GMT or none */
interface FormatSettings {
  /** Convert the time to UTC */
  utc: boolean;

  /** Convert the time to GMT */
  gmt: boolean;
}

/** List of masks to use */
type Masks = 'default' | 'shortDate' | 'mediumDate' | 'longDate' | 'fullDate' | 'shortTime' | 'mediumTime' |
  'longTime' | 'isoDate' | 'isoTime' | 'isoDateTime' | 'isoUtcDateTime' | 'expiresHeaderFormat';

interface DateI18n {
  dayNames: string[];
  monthNames: string[];
  timeNames: string[];
}

class Dateformat {
  /** Public settings to convert the time */
  public settings: FormatSettings;  
  
  /** Regex for timezones */
  public timezones: RegExp;

  /** Regex for timezone clips */
  public tzRegex: RegExp;

  /** Basic regex for a Token */
  public token: RegExp;

  /** List of masks avaliable to use */
  public masks: { [x in Masks]: string; };

  /** i18n setters */
  public i18n: DateI18n;

  /** The date itself */
  public date: Date;

  /**
   * Constructs a new instance of the `Dateformat` class
   * @param date The date to transform
   */
  constructor(date: Date | number) {
    this.settings = {
      utc: false,
      gmt: false
    };
    this.masks = {
      'default':               'ddd mmm dd yyyy HH:MM:ss',
      'shortDate':             'm/d/yy',
      'mediumDate':            'mmm d, yyyy',
      'longDate':              'mmmm d, yyyy',
      'fullDate':              'dddd, mmmm d, yyyy',
      'shortTime':             'h:MM TT',
      'mediumTime':            'h:MM:ss TT',
      'longTime':              'h:MM:ss TT Z',
      'isoDate':               'yyyy-mm-dd',
      'isoTime':               'HH:MM:ss',
      'isoDateTime':           'yyyy-mm-dd\'T\'HH:MM:sso',
      'isoUtcDateTime':        'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
      'expiresHeaderFormat':   'ddd, dd mmm yyyy HH:MM:ss Z'
    };
    this.i18n = {
      dayNames: [
        'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ],
      monthNames: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
      ],
      timeNames: [
        'a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'
      ]      
    };

    this.date = date instanceof Date ? date : new Date(date);
    this.token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|"[^"]*"|'[^']*'/g;
    this.timezones = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
    this.tzRegex = /[^-+\dA-Z]/g;
  }

  pad(value: any, length: number = 2): string {
    value = String(value);
    while (value.length < length) value = `0${value}`;

    return value;
  }

  getWeek() {
    const target = new Date(this.date.getFullYear(), this.date.getMonth(), this.date.getDate());
    const thurs = (target.getDate() - ((target.getDay() + 6) % 7) + 3);
    target.setDate(thurs);

    const first = new Date(target.getFullYear(), 0, 4);
    first.setDate(first.getDate() - ((target.getDay() + 6) % 7) + 3);

    // @ts-ignore
    const diff = (target - first) / (86400000 * 7);
    return 1 + Math.floor(diff); 
  }

  getDayOfWeek() {
    let dow = this.date.getDay();
    if (dow === 0) dow = 7;

    return dow;
  }

  getKindOf(value: any) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value !== 'object') return typeof value;
    if (Array.isArray(value)) return 'array';

    return {}.toString.call(value).slice(8, -2).toLowerCase();
  }

  parse(mask: Masks | string) {
    // If there is a mask and that mask doesn't exist
    mask = String(this.masks[mask] || mask || this.masks.default);

    const sliced = mask.slice(0, 4);
    if (sliced === 'UTC:' || sliced === 'GMT:') {
      const s = mask.slice(4);
      this.settings.utc = true;
      if (sliced === 'GMT:') this.settings.gmt = true;
    }

    const replacer = this.settings.utc ? 'getUTC' : 'get';
    const dict = {
      d: this.date[`${replacer}Date`](),
      D: this.date[`${replacer}Day`](),
      m: this.date[`${replacer}Month`](),
      y: this.date[`${replacer}FullYear`](),
      H: this.date[`${replacer}Hours`](),
      M: this.date[`${replacer}Minutes`](),
      s: this.date[`${replacer}Seconds`](),
      L: this.date[`${replacer}Milliseconds`](),
      o: this.settings.utc ? 0 : this.date.getTimezoneOffset(),
      W: this.getWeek(),
      N: this.getDayOfWeek()
    };

    const flags = {
      d: dict.d,
      dd: this.pad(dict.d),
      ddd: this.i18n.dayNames[dict.D],
      dddd: this.i18n.dayNames[dict.D + 7],
      m: dict.m + 1,
      mm: this.pad(dict.m + 1),
      mmm: this.i18n.monthNames[dict.m],
      mmmm: this.i18n.monthNames[dict.m + 12],
      yy: String(dict.y).slice(2),
      yyyy: dict.y,
      h: dict.H % 12 || 12,
      hh: this.pad(dict.H % 12 || 2),
      H: dict.H,
      HH: this.pad(dict.H),
      M: dict.M,
      MM: this.pad(dict.M),
      s: dict.s,
      ss: this.pad(dict.s),
      l: this.pad(dict.L, 3),
      L: this.pad(Math.round(dict.L / 10)),
      t: dict.H < 12 ? this.i18n.timeNames[0] : this.i18n.timeNames[1],
      tt: dict.H < 12 ? this.i18n.timeNames[2] : this.i18n.timeNames[3],
      T: dict.H < 12 ? this.i18n.timeNames[4] : this.i18n.timeNames[5],
      TT: dict.H < 12 ? this.i18n.timeNames[6] : this.i18n.timeNames[7],
      Z: this.settings.gmt ? 'GMT' : this.settings.utc ? 'UTC' : ((String(this.date).match(this.timezones)! || ['']) as any).pop().replace(this.tzRegex, ''),
      o: (dict.o > 0 ? '-' : '+') + this.pad(Math.floor(Math.abs(dict.o) / 60) * 100 + Math.abs(dict.o) % 60, 4),
      // @ts-ignore
      S: ['th', 'st', 'nd', 'rd'][dict.d % 10 > 3 ? 0 : (dict.d % 100 - dict.d % 10 != 10) * dict.d % 10],
      W: dict.W,
      N: dict.N
    };

    return mask.replace(this.token, (match) => {
      if (match in flags) return flags[match];
      return match.slice(1, match.length - 1);
    });
  }
}

export const dateformat = (date: Date | number) => new Dateformat(date);