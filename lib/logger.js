// lib/logger.js

const levels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const log_level = process.env.LOG_LEVEL || levels.DEBUG;

const format_section = (options) => {
  const { message, line_length = 60, section_char = '-' } = options;
  const padding_size = Math.max(0, Math.floor((line_length - message.length - 2) / 2));
  const left_padding = section_char.repeat(padding_size);
  const right_padding = section_char.repeat(line_length - message.length - 2 - padding_size);
  return `${left_padding} ${message} ${right_padding}`;
};

const logger = {
  error: (options = {}) => {
    const { message, debug_level = levels.ERROR } = typeof options === 'string' ? { message: options } : options;
    if (log_level >= debug_level) {
      console.error(message);
    }
  },
  warn: (options = {}) => {
    const { message, debug_level = levels.WARN } = typeof options === 'string' ? { message: options } : options;
    if (log_level >= debug_level) {
      console.warn(message);
    }
  },
  info: (options = {}) => {
    const { message, debug_level = levels.INFO } = typeof options === 'string' ? { message: options } : options;
    if (log_level >= debug_level) {
      console.info(message);
    }
  },
  debug: (options = {}) => {
    const { message, debug_level = levels.DEBUG } = typeof options === 'string' ? { message: options } : options;
    if (log_level >= debug_level) {
      console.log(message);
    }
  },
  section: (options) => {
    const opts = typeof options === 'string' ? { message: options } : options;
    if (log_level >= (opts.debug_level || levels.DEBUG)) {
      console.log(format_section(opts));
    }
  },
};

export default logger;
