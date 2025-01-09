import React from 'react';

const RadioAnswer = ({ value, label, name, onChange }) => (
  <label>
    <input
      type="radio"
      value={value}
      name = {name}
      onChange={onChange}
    />
    {label}
  </label>
);

export default RadioAnswer;
