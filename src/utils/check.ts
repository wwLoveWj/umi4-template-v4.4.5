/**
 * 校验工具函数
 * @author wwLoveWj
 */

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否为合法邮箱
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证手机号格式
 * @param phone 手机号
 * @returns 是否为合法手机号
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 验证密码强度
 * 要求：字母大小写、特殊字符、数字至少三种，且长度为8-32位
 * @param password 密码
 * @returns 校验结果对象
 */
export const validatePassword = (
  password: string
): { isValid: boolean; message: string } => {
  if (password.length < 8 || password.length > 32) {
    return { isValid: false, message: "密码长度必须在8-32位之间" };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const conditions = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar];
  const validConditions = conditions.filter(Boolean).length;

  if (validConditions < 3) {
    return {
      isValid: false,
      message: "密码必须包含字母大小写、特殊字符、数字中的至少三种",
    };
  }

  return { isValid: true, message: "密码格式正确" };
};
