export const EMPTY_FIELDS = {
  suburb:  '',
  postcode: '',
  weight:   '',
  length:   '',
  width:    '',
  height:   ''
};

export function validate(fields) {
  const errors = {};

  // suburb
  if (!fields.suburb.trim()) {
    errors.suburb = 'Destination suburb is required.';
  } else if (!/^[a-zA-Z\s\-]+$/.test(fields.suburb.trim())) {
    errors.suburb = 'Letters and spaces only.';
  } else if (fields.suburb.trim().length < 2) {
    errors.suburb = 'Suburb name is too short.';
  }

  // postcode
  if (!fields.postcode.trim()) {
    errors.postcode = 'Postal code is required.';
  } else if (!/^\d{4}$/.test(fields.postcode.trim())) {
    errors.postcode = 'Must be exactly 4 digits.';
  }

  // weight
  if (!fields.weight) {
    errors.weight = 'Weight is required.';
  } else if (isNaN(fields.weight) || +fields.weight <= 0) {
    errors.weight = 'Must be a positive number.';
  } else if (+fields.weight > 30) {
    errors.weight = 'Maximum is 30 kg.';
  }

  // dimensions — all or nothing
  const anyDim = fields.length || fields.width || fields.height;
  if (anyDim) {
    if (!fields.length || isNaN(fields.length) || +fields.length <= 0)
      errors.length = 'Required.';
    if (!fields.width  || isNaN(fields.width)  || +fields.width  <= 0)
      errors.width  = 'Required.';
    if (!fields.height || isNaN(fields.height) || +fields.height <= 0)
      errors.height = 'Required.';
  }

  return errors;
}