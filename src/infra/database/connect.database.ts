import { connect } from "mongoose";
import { DB_URI } from "../../config/config.js";

export const connectDB = async () => {
  try {
    await connect(DB_URI);
    console.log(`DataBase Connected Successfully`);
  } catch (error) {
    console.log(`DataBase Connection Failed`);
  }
};
