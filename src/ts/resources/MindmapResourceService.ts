import { APP, IResource, RESOURCE, ResourceType } from "..";
import { CreateParameters, CreateResult, MindmapUpdate, UpdateResult } from "./interface";
import { ResourceService } from "./ResourceService";

export class MindmapResourceService extends ResourceService {

  async create(parameters: CreateParameters): Promise<CreateResult> {
    const fixThumb = parameters.thumbnail
      ? await this.getThumbnailPath(parameters.thumbnail)
      : "";
    
    const res = await this.http.post<{_id: string}>(`/mindmap`, {
      name: parameters.name,
      description: parameters.description,
      thumbnail: fixThumb,
      folder: parameters.folder,
      map: `<map version="tango" theme="prism"><topic central="true" text="${parameters.name}"/></map>`,
      trashed: false,
      visibility: "OWNER",
    });

    this.checkHttpResponse(res);
    
    return {entId: res._id, thumbnail: fixThumb};
  }

  async update(parameters: MindmapUpdate): Promise<UpdateResult> {
    const fixThumb = parameters.thumbnail
      ? await this.getThumbnailPath(parameters.thumbnail)
      : "";
    const res = await this.http.put<IResource>(`/mindmap/${parameters.entId}`, {
      trashed: parameters.trashed,
      _id: parameters.entId,
      name: parameters.name,
      thumbnail: fixThumb,
      description: parameters.description,
      visibility: parameters.public ? "PUBLIC" : "OWNER",
    });
    this.checkHttpResponse(res);
    return { thumbnail: fixThumb, entId: parameters.entId } as UpdateResult;
  }
  getResourceType(): ResourceType {
    return RESOURCE.MINDMAP;
  }
  getApplication(): string {
    return APP.MINDMAP;
  }
  getFormUrl(folderId?: string): string {
    return folderId ? `/mindmap?folderid=${folderId}/new` : `/mindmap/new`;
  }
  getViewUrl(resourceId: string): string {
    return `/mindmap/id/${resourceId}`;
  }
  getPrintUrl(resourceId: string, withComment?: boolean): string {
    return `/mindmap/print/id/${resourceId}?comments=${withComment || true}`;
  }
}
ResourceService.register(
  { application: RESOURCE.MINDMAP, resourceType: RESOURCE.MINDMAP },
  (context) => new MindmapResourceService(context),
);
