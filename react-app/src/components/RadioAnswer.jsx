import React from 'react';

const RadioAnswer = ({ value, label, onChange }) => (
  <label>
    <input
      type="radio"
      value={value}
      onChange={onChange}
    />
    {label}
  </label>
);

export default RadioAnswer;
