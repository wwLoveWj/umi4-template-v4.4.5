import vstores from "vstores";

type StorageType = {
  "login-info": {
    email: string;
    loginName: string;
    loginPath: string;
    menuList: string[];
  };
  collect: any[];
  loginChecked: string;
  menuList: string[];
  tagList: { tagName: string; tagId: string }[];
};

export const storage = vstores.create<StorageType>({
  formatKey: (v: string) => {
    return "wj" + v;
  },
});
