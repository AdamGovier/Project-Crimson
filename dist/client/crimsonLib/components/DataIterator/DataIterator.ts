import CrimsonComponent from "../../base/CrimsonComponent";
import { FastifyRequest, FastifyReply } from 'fastify';
import { HttpPayload } from "../../interfaces/CrimsonHttp";

export default class DataIterator<T> extends CrimsonComponent {
    async getItems(controllerName: string, req: HttpPayload | undefined = undefined): Promise<T[]> {
        const response = await fetch(`http://localhost:3000/${controllerName}/Items?${new URLSearchParams(req?.query ?? {}).toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            body: req?.body ? JSON.stringify(req.body) : undefined
        });
        const json = await response.json();
        return json;
    }
}
