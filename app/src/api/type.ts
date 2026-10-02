// 角色
interface Common {
  create_at?: string;
  update_at?: string;
}

export interface Role extends Common{
  id?: number;
  identify?: string;
  name?: string;
  is_active?: number;
  remark?: any;
  create_id?: number;
}

