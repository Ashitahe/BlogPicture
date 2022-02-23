<template>
  <div>
    <!-- 顶部显示表格 -->
    <el-button
      type="primary"
      size="default"
      icon="el-icon-plus"
      @click="showDialog"
      >添加</el-button
    >
    <el-table
      :data="trademarks"
      border
      style="width: 100%; margin-top: 20px"
      v-loading="loading"
    >
      <el-table-column label="序号" width="80" align="center" type="index">
      </el-table-column>
      <el-table-column label="品牌名称" prop="tmName"></el-table-column>
      <el-table-column label="品牌LOGO">
        <template slot-scope="{ row }">
          <img :src="row.logoUrl" style="width: 100px; height: 60px" />
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="{ row }">
          <el-button
            type="warning"
            size="mini"
            icon="el-icon-edit"
            @click="showDialog(row)"
            >修改</el-button
          >
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            @click="deleteTrademark(row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      :page-sizes="[3, 5, 7]"
      :page-size="limit"
      :current-page="page"
      :total="total"
      :pager-count="btns"
      @size-change="sizeChange"
      @current-change="getTrademark"
      style="text-align: center; margin: 20px 0"
      layout=" prev, pager, next, jumper, ->, sizes, total"
    >
    </el-pagination>
    <!-- 增改对话框 -->
    <el-dialog title="添加品牌" :visible.sync="dialogFormVisible">
      <el-form label-width="100px" :model="form" :rules="rules" ref="ruleForm">
        <el-form-item label="品牌名称" prop="tmName">
          <el-input v-model="form.tmName" style="width: 70%"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" size="normal" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            :action="`${$BASE_API}/admin/product/fileUpload`"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">
              只能上传jpg/png文件，且不超过50kb
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdate">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "",
  components: {},
  data() {
    return {
      loading: false,
      // 显示表格控制
      page: 1,
      limit: 3,
      total: 0,
      btns: 7,
      trademarks: [],

      // 对话框控制
      dialogFormVisible: false,
      form: {
        tmName: "",
        logoUrl: "",
      },
      // 表单校验规则
      rules: {
        tmName: [
          {
            required: true,
            message: "请输入品牌名称",
            trigger: "blur",
          },
          {
            min: 2,
            max: 10,
            message: "长度在2到5个字符",
            trigger: "blur",
          },
        ],
        logoUrl: [
          {
            required: true,
            message: "请上传图片",
            trigger: "change",
          },
        ],
      },
    };
  },
  mounted() {
    this.getTrademark();
  },
  methods: {
    // 获取当前页面商品列表
    async getTrademark(page = 1) {
      this.loading = true;
      this.page = page;
      try {
        const res = await this.$API.trademark.getTrademarkPage(
          page,
          this.limit
        );
        if (res.code === 200) {
          const { data } = res;
          this.trademarks = data.records;
          this.total = data.total;
          this.loading = false;
        }
      } catch (err) {
        console.log("网络请求异常", err);
      }
    },
    // 改变一页显示的条数
    sizeChange(limit) {
      this.limit = limit;
      this.getTrademark();
    },
    // 上传前检查图片文件
    handleAvatarSuccess(res, file) {
      this.form.logoUrl = res.data;
    },
    beforeAvatarUpload(file) {
      // const isJPG = file.type === "image/jpeg";
      const isLt2M = file.size / 1024 < 50;
      const checkValue = ["image/jpeg", "image/png"];
      const isJPGOrPNG = checkValue.indexOf(file.type) === -1 ? false : true;
      if (!isJPGOrPNG) {
        this.$message.error("上传头像图片只能是 JPG 或 PNG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 50KB!");
      }
      return isJPGOrPNG && isLt2M;
    },

    // 控制对话框显示
    showDialog(trademark) {
      // console.log(trademark);
      if (!trademark.id) {
        this.form.logoUrl = "";
        this.form.tmName = "";
      } else {
        // 存入数据 浅拷贝
        Object.assign(this.form, trademark);
      }
      this.dialogFormVisible = true;
    },
    // 添加或修改品牌信息
    addOrUpdate() {
      // 判断是修改还是添加 添加为true
      let flag = true;
      if (this.form.id) flag = false;
      // 进行表单校验
      this.$refs.ruleForm.validate(async (valid) => {
        if (valid) {
          try {
            const res = await this.$API.trademark.addOrUpdate(this.form, flag);
            if (res.code === 200) {
              this.dialogFormVisible = false;
              // 刷新当前页码
              if (!flag) this.getTrademark(this.page);
              else this.getTrademark();
            }
          } catch (error) {
            console.log("添加品牌网络请求失败", error);
          }
        } else {
          this.$message({
            type: "info",
            message: "表单验证失败",
          });
        }
      });
    },
    // 删除品牌信息
    deleteTrademark(id) {
      // 弹出确认删除提示框
      this.$confirm("确认删除该品牌?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            const res = await this.$API.trademark.deleteTrademark(id);
            if (res.code === 200) {
              this.$message({
                type: "success",
                message: "删除成功!",
              });
              // 刷新当前页
              if (this.trademarks.length > 1) this.getTrademark(this.page);
              else this.getTrademark(this.page - 1);
            }
          } catch (error) {
            console.log("删除商品网络请求失败", error);
            this.$message({
              type: "info",
              message: "删除失败",
            });
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
  },
};
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>