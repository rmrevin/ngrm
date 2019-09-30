export function validateRuPhone (value?: string): boolean {
  if (!value) {
    return false;
  }

  return /^7[0-9]{10}$/.test(value.replace(/[^0-9]+/g, ''));
}

// эта валидация проверяет, что строка является валидным uuid
export function validateUuid (value?: string): boolean {
  if (!value) {
    return false;
  }

  return /^[0-9A-F]{8}-?[0-9A-F]{4}-?4[0-9A-F]{3}-?[89AB][0-9A-F]{3}-?[0-9A-F]{12}$/i.test(value);
}

// эта валидация проверяет, что строка "похожа" на uuid
export function validateRandomUuid (value?: string): boolean {
  if (!value) {
    return false;
  }

  return /^[0-9A-F]{8}-?[0-9A-F]{4}-?[0-9A-F]{4}-?[0-9A-F]{4}-?[0-9A-F]{12}$/i.test(value);
}

export function validateBik (value: number | string, error): boolean {
  let result = false;

  const bik = value === null ? '' : String(value);

  if (!bik.length) {
    error.code = 1;
    error.message = 'БИК пуст';
  } else if (/[^0-9]/.test(bik)) {
    error.code = 2;
    error.message = 'БИК может состоять только из цифр';
  } else if (bik.length !== 9) {
    error.code = 3;
    error.message = 'БИК может состоять только из 9 цифр';
  } else {
    result = true;
  }

  return result;
}

export function validateInn (value: number | string, error): boolean {
  let result = false;

  const inn = value === null ? '' : String(value);

  if (!inn.length) {
    error.code = 1;
    error.message = 'ИНН пуст';
  } else if (/[^0-9]/.test(inn)) {
    error.code = 2;
    error.message = 'ИНН может состоять только из цифр';
  } else if ([10, 12].indexOf(inn.length) === -1) {
    error.code = 3;
    error.message = 'ИНН может состоять только из 10 или 12 цифр';
  } else {
    const checkDigit = function (val: string, coefficients: Array<number>): number {
      let n = 0;
      for (const i in coefficients) {
        if (typeof coefficients[i] !== 'number') {
          continue;
        }

        n += coefficients[i] * parseInt(val[i], 10);
      }

      return Math.floor((n % 11) % 10);
    };

    switch (inn.length) {
      case 10:
        const n10 = checkDigit(inn, [2, 4, 10, 3, 5, 9, 4, 6, 8]);
        if (n10 === parseInt(inn[9], 10)) {
          result = true;
        }
        break;
      case 12:
        const n11 = checkDigit(inn, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
        const n12 = checkDigit(inn, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
        if (n11 === parseInt(inn[10], 10) && n12 === parseInt(inn[11], 10)) {
          result = true;
        }
        break;
      default:
        error.code = 4;
        error.message = 'Неправильное контрольное число';
        break;
    }

    if (!result) {
      error.code = 4;
      error.message = 'Неправильное контрольное число';
    }
  }

  return result;
}

export function validateKpp (value, error): boolean {
  let result = false;

  const kpp = value === null ? '' : String(value);

  if (!kpp.length) {
    error.code = 1;
    error.message = 'КПП пуст';
  } else if (kpp.length !== 9) {
    error.code = 2;
    error.message = 'КПП может состоять только из 9 знаков (цифр или заглавных букв латинского алфавита от A до Z)';
  } else if (!/^[0-9]{4}[0-9A-Z]{2}[0-9]{3}$/.test(kpp)) {
    error.code = 3;
    error.message = 'Неправильный формат КПП';
  } else {
    result = true;
  }

  return result;
}

export function validateKs (value: number | string, bik: number | string, error): boolean {
  let result = false;
  if (validateBik(bik, error)) {
    const ks = value === null ? '' : String(value);

    if (!ks.length) {
      error.code = 1;
      error.message = 'К/С пуст';
    } else if (/[^0-9]/.test(ks)) {
      error.code = 2;
      error.message = 'К/С может состоять только из цифр';
    } else if (ks.length !== 20) {
      error.code = 3;
      error.message = 'К/С может состоять только из 20 цифр';
    } else {
      const bikKs = `0${bik.toString().slice(4, 6)}${ks}`;
      let checksum = 0;
      const coefficients = [7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1];
      for (const i in coefficients) {
        if (!coefficients[i]) {
          continue;
        }

        checksum += coefficients[i] * (parseInt(bikKs[i], 10) % 10);
      }
      if (checksum % 10 === 0) {
        result = true;
      } else {
        error.code = 4;
        error.message = 'Неправильное контрольное число';
      }
    }
  }

  return result;
}

export function validateOgrn (value: number | string, error): boolean {
  let result = false;

  const ogrn = value === null ? '' : String(value);

  if (!ogrn.length) {
    error.code = 1;
    error.message = 'ОГРН пуст';
  } else if (/[^0-9]/.test(ogrn)) {
    error.code = 2;
    error.message = 'ОГРН может состоять только из цифр';
  } else if (ogrn.length !== 13) {
    error.code = 3;
    error.message = 'ОГРН может состоять только из 13 цифр';
  } else {
    const n13 = parseInt((parseInt(ogrn.slice(0, -1), 10) % 11).toString().slice(-1), 10);
    if (n13 === parseInt(ogrn[12], 10)) {
      result = true;
    } else {
      error.code = 4;
      error.message = 'Неправильное контрольное число';
    }
  }

  return result;
}

export function validateOgrnIp (value: number | string, error): boolean {
  let result = false;

  const ogrnip = value === null ? '' : String(value);

  if (!ogrnip.length) {
    error.code = 1;
    error.message = 'ОГРНИП пуст';
  } else if (/[^0-9]/.test(ogrnip)) {
    error.code = 2;
    error.message = 'ОГРНИП может состоять только из цифр';
  } else if (ogrnip.length !== 15) {
    error.code = 3;
    error.message = 'ОГРНИП может состоять только из 15 цифр';
  } else {
    const n15 = parseInt((parseInt(ogrnip.slice(0, -1), 10) % 13).toString().slice(-1), 10);
    if (n15 === parseInt(ogrnip[14], 10)) {
      result = true;
    } else {
      error.code = 4;
      error.message = 'Неправильное контрольное число';
    }
  }

  return result;
}

export function validateRs (value: number | string, bik: number | string, error): boolean {
  let result = false;
  if (validateBik(bik, error)) {
    const rs = value === null ? '' : String(value);

    if (!rs.length) {
      error.code = 1;
      error.message = 'Р/С пуст';
    } else if (/[^0-9]/.test(rs)) {
      error.code = 2;
      error.message = 'Р/С может состоять только из цифр';
    } else if (rs.length !== 20) {
      error.code = 3;
      error.message = 'Р/С может состоять только из 20 цифр';
    } else {
      const bikRs = bik.toString().slice(-3) + rs;
      let checksum = 0;
      const coefficients = [7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1];
      for (const i in coefficients) {
        if (!coefficients[i]) {
          continue;
        }

        checksum += coefficients[i] * (parseInt(bikRs[i], 10) % 10);
      }
      if (checksum % 10 === 0) {
        result = true;
      } else {
        error.code = 4;
        error.message = 'Неправильное контрольное число';
      }
    }
  }

  return result;
}

export function validateSnils (value: number | string, error): boolean {
  let result = false;

  const snils = value === null ? '' : String(value);

  if (!snils.length) {
    error.code = 1;
    error.message = 'СНИЛС пуст';
  } else if (/[^0-9]/.test(snils)) {
    error.code = 2;
    error.message = 'СНИЛС может состоять только из цифр';
  } else if (snils.length !== 11) {
    error.code = 3;
    error.message = 'СНИЛС может состоять только из 11 цифр';
  } else {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(snils[i], 10) * (9 - i);
    }
    let checkDigit = 0;
    if (sum < 100) {
      checkDigit = sum;
    } else if (sum > 101) {
      checkDigit = Math.floor(sum % 101);
      if (checkDigit === 100) {
        checkDigit = 0;
      }
    }
    if (checkDigit === parseInt(snils.slice(-2), 10)) {
      result = true;
    } else {
      error.code = 4;
      error.message = 'Неправильное контрольное число';
    }
  }

  return result;
}

export function validateCardNumber (value): boolean {
  return /^[0-9]{16}$/.test(value.replace(/[^0-9]+/g, ''));
}
