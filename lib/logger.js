// lib/logger.js

const levels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const log_level = process.env.LOG_LEVEL ?? levels.DEBUG;
const show_extra_logs = (process.env.SHOW_EXTRA_LOGS?.toString().toLocaleLowerCase() === 'true') ?? false;

const format_section = (options) => {
  const { message, line_length = 60, section_char = '-' } = options;
  const padding_size = Math.max(0, Math.floor((line_length - message.length - 2) / 2));
  const left_padding = section_char.repeat(padding_size);
  const right_padding = section_char.repeat(line_length - message.length - 2 - padding_size);
  return `${left_padding} ${message} ${right_padding}`;
};



const logger = {
  error: (message) => {
    if (log_level >= levels.ERROR) {
      console.error(message);
    }
  },
  warn: (message) => {
    if (log_level >= levels.WARN) {
      console.warn(message);
    }
  },
  info: (message) => {
    if (log_level >= levels.INFO) {
      console.info(message);
    }
  },
  debug: (message) => {
    if (log_level >= levels.DEBUG) {
      console.log(message);
    }
  },
  section: (options) => {
    const opts = typeof options === 'string' ? { message: options } : options;
    if (log_level >= levels.DEBUG) {
      console.log(format_section(opts));
    }
  },
  extra: (message) => {
    if (show_extra_logs) {
      console.log(message);
    }
  },
};

export default logger;
