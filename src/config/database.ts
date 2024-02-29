import mongoose from "mongoose";

const uri = "mongodb+srv://datnd:123@datnddev.6dxvgtt.mongodb.net/?retryWrites=true&w=majority&appName=DatndDev";

const connectDB = async (): Promise<void> => {
	try {
		const { connection } = await mongoose.connect(uri as string);
		console.log("Connected to the database");
	} catch (error) {
		console.error("⚡️[server]: Connect db failed", error);
		console.log("Shutting down the server due to Unhandled Promise Rejection...");
		process.exit(1);
	}
};

export default connectDB;
