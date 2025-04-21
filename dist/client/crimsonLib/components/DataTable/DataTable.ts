import CrimsonComponent from "../../base/CrimsonComponent";
import { FastifyRequest, FastifyReply } from 'fastify';
import { HttpPayload } from "../../interfaces/CrimsonHttp";
import { FindOptionsWhere } from "typeorm";

export interface DataTableResponse<T> {
    totalItemCount: number;
    itemsForPage: T[];
}

export default class DataTable<T> extends CrimsonComponent {
    async getTableItems(controllerName: string, req: HttpPayload | undefined = undefined): Promise<DataTableResponse<T>> {
        const response = await fetch(`http://localhost:3000/${controllerName}/TableItems?${new URLSearchParams(req?.query ?? {}).toString()}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            body: req?.body ? JSON.stringify(req.body) : undefined
        });
        const json = await response.json();
        return json;
    }
    /*!--empty-line--!*/
    async postSeed(controllerName: string, req: HttpPayload<T[]> | undefined = undefined): Promise<T[]> {
        const response = await fetch(`http://localhost:3000/${controllerName}/Seed?${new URLSearchParams(req?.query ?? {}).toString()}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: req?.body ? JSON.stringify(req.body) : undefined
        });
        const json = await response.json();
        return json;
    }
    /*!--empty-line--!*/
    async deleteItem(controllerName: string, req: HttpPayload<T> | undefined = undefined) {
        const response = await fetch(`http://localhost:3000/${controllerName}/Item?${new URLSearchParams(req?.query ?? {}).toString()}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: req?.body ? JSON.stringify(req.body) : undefined
        });
        const json = await response.json();
        return json;
    }
}
