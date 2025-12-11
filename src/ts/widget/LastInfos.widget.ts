import { transport } from "../transport/Framework";

export interface ILastInfosModel {
  modifiedDate: string; // "2021-03-24T16:36:05.398"
  thread: {
    id: number; // 221
    icon: string; // "/workspace/document/36a04526-15a2-4e8f-adb6-cca75630e50d"
    title: string; // "News collège Denis Poisson"
    sharedRights: []; 
  },
  title: string; // "xx"
  username: string; // "DEVAULX ALAIN"
  id: number; // 597
}

export class LastInfosWidget {
  loadInfos(maxResults: number): Promise<ILastInfosModel[]> {
    return transport.http.get("/actualites/api/v1/infos/preview/last/" + maxResults);
  }

  getMaxResults(): Promise<number> {
    return transport.http
      .get("/userbook/preference/maxInfos")
      .then((maxInfos) => {
        return maxInfos.preference ? parseInt(maxInfos.preference) : 4;
      });
  }

  setMaxResults(maxResults: number): Promise<void> {
    return transport.http.putJson(
      "/userbook/preference/maxInfos",
      `"${maxResults}"`,
    );
  }
}
