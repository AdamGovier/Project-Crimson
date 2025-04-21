import CrimsonComponent from "../../base/CrimsonComponent";
import { FastifyRequest, FastifyReply } from 'fastify';
import { HttpPayload } from "../../interfaces/CrimsonHttp";

export default class Form<T> extends CrimsonComponent {
    async postCreate(controllerName: string, payload: HttpPayload<T> | undefined = undefined): Promise<T> {
        const response = await fetch(`http://localhost:3000/${controllerName}/Create?${new URLSearchParams(req?.query ?? {}).toString()}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: req?.body ? JSON.stringify(req.body) : undefined
        });
        const json = await response.json();
        return json;
    }
}
