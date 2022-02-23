<template>
  <div>
    <el-table
      :data="category1Info"
      v-loading="loading"
      style="width: 100%"
      :row-key="getRowKey"
      lazy
      :load="load"
      border
      :tree-props="{ hasChildren: 'hasChildren' }"
      :row-class-name="tableRowClassName"
    >
      <el-table-column prop="id" label="分类ID" width="180" align="center">
      </el-table-column>
      <el-table-column label="分类名称" sortable>
        <template slot-scope="{ row }">
          <el-input
            v-if="row.edit"
            :ref="`${row.level}:${row.id}`"
            v-model="row.inputValue"
            @blur="noEdit(row)"
            @keyup.enter.native="noEdit(row)"
          ></el-input>
          <el-row v-else>{{ row.name }}</el-row>
        </template>
      </el-table-column>
      <el-table-column width="300" align="center">
        <template slot="header">
          <el-input
            placeholder="按Enter键添加一级分类"
            style="width: 250xp"
            v-model="category1Info.inputValue"
          ></el-input>
        </template>
        <template slot-scope="{ row }">
          <HitButton
            title="添加子分类"
            type="primary"
            icon="el-icon-plus"
            size="mini"
            @click="add(row)"
            :disabled="row.level === 3"
          ></HitButton>
          <HitButton
            title="编辑"
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="edit(row)"
          ></HitButton>
          <HitButton
            title="删除"
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCategory(row)"
          ></HitButton>
        </template>
      </el-table-column>
    </el-table>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="dialogFormVisible">
      <el-form :model="form" label-width="80">
        <el-form-item label="分类名称">
          <el-input
            v-model="form.name"
            ref="dialogInput"
            placeholder="请输入分类名称"
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategory">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { sku } from "@/api";
export default {
  name: "",
  data() {
    return {
      loading: false, // 加载动画显示
      //   表格显示
      category1Info: [], // 表格数据
      inputValue: "", // 一级分类输入框输入的内容
      dialogFormVisible: false, // 对话框显示
      form: {
        // 对话框表单
        name: "",
      },
      sku: {}, // 保存当前分类属性
    };
  },
  mounted() {
    this.get1Category();
  },
  methods: {
    //   获取一级分类数据
    async get1Category() {
      this.loading = true;
      try {
        const res = await this.$API.categorySelector.reqCate1List();
        if (res.code === 200) {
          let { data } = res;
          data = data.map((item) => ({
            hasChildren: true,
            id: item.id,
            name: item.name,
            level: 1,
            edit: false,
            inputValue: item.name, // 用于保存输入值
          }));
          this.category1Info = data;
        }
      } catch (error) {
        this.$message.error(error);
      } finally {
        this.loading = false;
      }
    },
    // 懒加载二、三级分类列表函数
    async load(tree, treeNode, resolve) {
      const { id, level } = tree;
      console.log("id", id, "level", level);
      try {
        // 如果是一级分类列表点击的，则加载二级分类列表
        if (level === 1) {
          const res = await this.$API.categorySelector.reqCate2List(id);
          if (res.code === 200) {
            let { data } = res;
            data = data.map((item) => ({
              hasChildren: true,
              id: item.id,
              name: item.name,
              level: 2,
              edit: false,
              category1Id: id, // 预先保存上级分类id，修改或更新时使用
              inputValue: item.name, // 用于保存输入值
            }));
            // 将二级分类列表展开
            resolve(data);
          }
        } else {
          // 如果是二级分类列表点击的，则加载三级分类列表
          const res = await this.$API.categorySelector.reqCate3List(id);
          if (res.code === 200) {
            let { data } = res;
            data = data.map((item) => ({
              id: item.id,
              name: item.name,
              level: 3,
              edit: false,
              category2Id: id, // 预先保存上级分类id，修改或更新时使用
              inputValue: item.name, // 用于保存输入值
            }));
            // 将三级分类列表展开
            resolve(data);
          }
        }
      } catch (error) {
        this.$message.error(error);
      }
    },
    // 获取唯一的row-key
    getRowKey(row) {
      return `${row.id}:${row.level}`;
    },
    // 删除分类 deleteCategory
    async deleteCategory(row) {
      try {
        const res = await this.$API.categorySelector.deleteCategory(row);
        console.log(res);
        this.$message.success("删除成功");
        this.get1Category();
      } catch (error) {
        this.$message.error(error);
      }
    },
    // 添加分类
    add(row) {
      this.dialogFormVisible = true;
      this.sku = row;
      // 自动获取焦点
      this.$nextTick(() => this.$refs.dialogInput.focus());
    },
    async addCategory() {
      // console.log("添加", row);
      const { level, id } = this.sku;
      const { form } = this;
      // 空值检测
      if (form.name.trim() === "") {
        this.$message.info("输入值不能为空");
        form.name = "";
        return;
      }
      this.dialogFormVisible = false;
      try {
        const res = await this.$API.categorySelector.add({
          level,
          id,
          name: form.name,
        });
        if (res.code === 200) {
          this.$message.success("添加分类成功");
          // 判断是几级列表修改或添加

          // if (row.category1Id === undefined && row.category2Id === undefined) {
          //   this.get1Category();
          // } else {
          //   console.log('进懒加载了');
          //   this.load(row);
          // }
        }
      } catch (error) {
        this.$message.error(error);
      }
    },
    // 修改分类
    async edit(row) {
      // 变成编辑模式
      row.edit = true;
      //  自动获取焦点
      const index = `${row.level}:${row.id}`;
      this.$nextTick(() => this.$refs[index].focus());
    },
    // 查看模式
    async noEdit(row) {
      //   输入检测
      const { name } = row;
      // 空值检测
      if (row.inputValue.trim() === "") {
        this.$message.info("输入值不能为空");
        row.inputValue = name; // 重新赋值
        return;
      }
      // 变成查看模式
      row.edit = false;
      // 若未修改则不发送网络请求
      if (row.inputValue.trim() === name) return;

      //   发送请求修改
      console.log("row", row);
      console.log(
        "布尔值",
        row.hasOwnProperty("category1Id") || row.hasOwnProperty("category2Id")
      );
      try {
        const res = await this.$API.categorySelector.update(row);
        if (res.code === 200) {
          // 判断是几级列表修改或添加
          if (
            row.hasOwnProperty("category1Id") ||
            row.hasOwnProperty("category2Id")
          ) {
            console.log("进load");
            this.load(row);
          } else {
            console.log("进入get1");
            this.get1Category();
          }
          this.$message.success("修改分类成功");
        }
      } catch (error) {
        this.$message.error(error);
      }
    },
    /* 
    返回二级分类列表的类名
    */
    tableRowClassName({ row }) {
      //   console.log(row);
      if (row.level === 2) {
        return "level2-row";
      }
    },
  },
};
</script>
<style>
.el-table .level2-row {
  background: #f2ffe9;
}
</style>