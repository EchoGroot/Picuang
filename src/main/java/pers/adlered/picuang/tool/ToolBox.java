package pers.adlered.picuang.tool;

import org.springframework.util.ClassUtils;

import java.io.File;
import java.util.UUID;

/**
 * <h3>picuang</h3>
 * <p>工具箱</p>
 *
 * @author : https://github.com/AdlerED
 * @date : 2019-11-06 11:09
 **/
public class ToolBox {
    public static String getSuffixName(String filename) {
        String suffixName = filename.substring(filename.lastIndexOf("."));
        suffixName = suffixName.toLowerCase();
        return suffixName;
    }

    public static boolean isPic(String suffixName) {
        return (suffixName.equals(".jpeg") || suffixName.equals(".jpg") || suffixName.equals(".png") || suffixName.equals(".gif") || suffixName.equals(".svg"));
    }

    public static File generatePicFile(String suffixName) {
        String path = ClassUtils.getDefaultClassLoader().getResource("").getPath() + "static/uploadImages/";
        String fileName = UUID.randomUUID() + suffixName;
        return new File(path + fileName);
    }
}
