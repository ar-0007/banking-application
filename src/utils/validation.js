const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return typeof value === "string" && UUID_RE.test(value);
}

function isPositiveMoneyString(value) {
  // Accept decimal strings only, to avoid JavaScript floating-point input surprises.
  return typeof value === "string" &&
    /^\d{1,13}(\.\d{1,2})?$/.test(value) &&
    /[1-9]/.test(value) &&
    Number(value) > 0;
}

function isNonNegativeMoneyString(value) {
  return typeof value === "string" &&
    /^\d{1,13}(\.\d{1,2})?$/.test(value);
}

module.exports = { isUuid, isPositiveMoneyString, isNonNegativeMoneyString };
