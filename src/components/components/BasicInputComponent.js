import React, { Component } from 'react';
import form_styles from '@/styles/forms/CheckoutForm.module.scss'

class BasicInputComponent extends Component {
  render() {
    const { label, id, placeholder, type = 'text' } = this.props;

    return (
      <div className={form_styles.input_container}>
        <div className={form_styles.input_label_container}>
          <div className={form_styles.input_label}>{label}</div>
        </div>
        <input
          id={id}
          type={type}
          className={form_styles.input_textbox}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>
    );
  }
}

export default BasicInputComponent;