import React from 'react';

const RadioAnswer = ({ value, label, name, onChange, checked }) => (
  <label>
    <input
      type="radio"
      value={value}
      name={name}
      onChange={onChange}
      checked={checked}
    />
    {label}
  </label>
);

export default RadioAnswer;
