import { CallbackError, connect } from "mongoose";
import { env } from "node:process"

export default (): string | undefined | void => {

    return connect("mongodb+srv://newlayer:loginlogout123_D@cluster0.pbh4p1y.mongodb.net/login?retryWrites=true&w=majority", logger);

    function logger(error: CallbackError | null) {
        return error
            ? `Houve um erro ao me conectar com o banco de dados!\nError: ${error}`
            : "Conexão efetuada com sucesso!"
    }
};