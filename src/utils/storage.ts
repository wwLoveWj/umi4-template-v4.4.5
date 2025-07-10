import vstores from "vstores";

type StorageType = {
  "login-info": API.LoginInfoType;
  collect: any[];
  loginChecked: string;
  menuList: string[];
  tagList: { tagName: string; tagId: string }[];
  todoList: {
    title: string;
    description: string;
    noticeTime: string;
    status: number;
    todoId: string;
  }[];
  html5QrCode: any;
};

export const storage = vstores.create<StorageType>({
  formatKey: (v: string) => {
    return "wj" + v;
  },
});
