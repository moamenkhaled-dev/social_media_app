import parsePhoneNumberFromString from "libphonenumber-js/max";
import type { CountryCode } from "libphonenumber-js";
import { BadRequestError } from "../errors/client.errors.js";

export const phoneValidator = async ({
  countryCode,
  phone,
}: {
  countryCode: CountryCode;
  phone: string;
}) => {
  if (phone && typeof phone !== "string") {
    throw new BadRequestError("invalid phone type phone must be string");
  }
  const phoneNumber = parsePhoneNumberFromString(phone, countryCode);
  if (!phoneNumber) {
    throw new BadRequestError("try another phone");
  }
  if (phoneNumber.country !== countryCode) {
    throw new BadRequestError("invalid country code");
  }
  if (!phoneNumber || !phoneNumber.isValid()) {
    throw new BadRequestError("invalid phone number");
  }
  const type = phoneNumber.getType();
  if (type !== "MOBILE" && type !== "FIXED_LINE_OR_MOBILE") {
    throw new BadRequestError("invalid phone type");
  }

  return phoneNumber.number;
};
