import mongoose, {Schema, Document} from "mongoose";

export interface IAddOn extends Document {

    name: string;
    description: string;
    price: number;
    category: string;
    isActive: boolean;
    associatedProductCategories: string[];

}

const AddOnSchema: Schema = new Schema({

    name: { type: String, required: true, unique: true }, // Nombre del producto, obligatorio y único
    description: { type: String }, // Descripción del producto
    price: { type: Number, required: true }, // Precio del producto, obligatorio
    category: { type: String, required: true}, // Categoría del producto
    isActive: { type: Boolean, required: true, default: true },
    associatedProductCategories: { type: [String], required: true },

}, {
  timestamps: true, // Añade automáticamente campos createdAt y updatedAt
});

const AddOn = mongoose.model<IAddOn>('Adicional', AddOnSchema);

export default AddOn;