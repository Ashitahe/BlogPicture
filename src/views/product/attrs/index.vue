<template>
  <div>
    <el-card>
      <CategorySelector
        @categoryIdChange="categoryIdChange"
        :disabled="isShowAddAttrs"
      ></CategorySelector>
    </el-card>
    <el-card style="margin-top: 20px">
      <!-- 属性表格页 -->
      <div v-show="!isShowAddAttrs">
        <el-button
          type="primary"
          size="default"
          icon="el-icon-plus"
          @click="showAttrAdd(false)"
          :disabled="category3Id === ''"
          >添加属性</el-button
        >
        <el-table
          :data="tableData"
          style="width: 100%"
          border
          v-loading="loading"
        >
          <el-table-column label="序号" type="index" width="80" align="center">
          </el-table-column>
          <el-table-column
            label="属性名称"
            width="150"
            align="center"
            prop="attrName"
          >
          </el-table-column>
          <el-table-column label="属性值列表"
            ><template slot-scope="{ row }">
              <el-tag
                type="info"
                v-for="value in row.attrValueList"
                :key="value.id"
                style="margin-left: 5px"
              >
                {{ value.valueName }}
              </el-tag>
            </template></el-table-column
          >
          <el-table-column label="操作" width="150" align="center">
            <template slot-scope="{ row }">
              <HitButton
                type="primary"
                size="mini"
                icon="el-icon-edit"
                title="编辑"
                @click.native="showAttrAdd(row)"
              ></HitButton>
              <el-popconfirm
                :title="`你确定要删除${row.attrName}吗?`"
                @onConfirm="delAttrs(row.id)"
              >
                <HitButton
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  title="删除"
                  style="margin-left: 10px"
                  slot="reference"
                ></HitButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加属性页 -->
      <div v-show="isShowAddAttrs">
        <el-form :model="formData" inline>
          <el-form-item label="属性名">
            <el-input
              v-model="formData.attrName"
              placeholder="请输入属性名"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addAttrsValue"
          :disabled="formData.attrName === ''"
          >添加属性值</el-button
        >
        <el-button @click="isShowAddAttrs = false">取消</el-button>
        <el-table :data="formData.attrValueList" border style="margin: 20px 0">
          <el-table-column
            label="序号"
            type="index"
            width="80"
            align="center"
          ></el-table-column>
          <el-table-column label="属性名称">
            <template slot-scope="{ row, $index }">
              <el-input
                size="mini"
                placeholder="请输入名称"
                v-model="row.valueName"
                v-if="row.edit"
                :ref="$index"
                @blur="toList(row)"
                @keyup.enter.native="toList(row)"
              ></el-input>
              <span
                v-else
                @click="toEdit(row, $index)"
                style="display: inline-block; width: 100%"
                >{{ row.valueName }}</span
              >
            </template>
          </el-table-column>
          <el-table-column label="操作"
            ><template slot-scope="{ row, $index }">
              <el-popconfirm
                :title="`确定要删除${row.valueName}吗?`"
                @onConfirm="delAttrValue($index)"
              >
                <HitButton
                  slot="reference"
                  icon="el-icon-delete"
                  title="删除"
                  type="danger"
                  size="mini"
                ></HitButton>
              </el-popconfirm> </template
          ></el-table-column>
        </el-table>
        <el-button
          type="primary"
          @click="addAttrs"
          :disabled="formData.attrValueList.length === 0"
          >保存</el-button
        >
        <el-button @click="isShowAddAttrs = false">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "",
  data() {
    return {
      // 展示的数据
      tableData: [],
      loading: false,
      // 控制列表显示
      isShowAddAttrs: false,
      isAdd: true,
      // 子组件传递过来的id数据
      category1Id: "",
      category2Id: "",
      category3Id: "",
      // 收集表单数据
      formData: {
        attrName: "",
        attrValueList: [],
        categoryId: 0,
        categoryLevel: 3,
      },
    };
  },
  methods: {
    // 添加属性值
    addAttrsValue() {
      // 添加一个属性值
      this.formData.attrValueList.push({
        attrId: this.formData.id,
        valueName: "",
        edit: true,
      });
      // 添加一个属性的时候自动聚焦
      this.$nextTick(() => {
        this.$refs[this.formData.attrValueList.length - 1].focus();
      });
    },
    // 显示属性添加页面
    showAttrAdd(AttrInfo) {
      this.isShowAddAttrs = true;
      if (AttrInfo) {
        this.formData = cloneDeep(AttrInfo);
      } else {
        // 重置一下数据
        this.formData = {
          attrName: "", // 属性名
          attrValueList: [], // 属性值列表
          categoryId: this.category3Id, // 当前第3级分类ID
          categoryLevel: 3, // 分类级别
        };
      }
    },
    // 添加属性
    async addAttrs() {
      // 整理参数
      const { formData } = this;
      formData.attrValueList = formData.attrValueList.filter((item) => {
        if (item.valueName) {
          // 删除edit属性
          delete item.edit;
          return true;
        }
        return false;
      });
      // 如果属性值数组为空则不添加
      if (formData.attrValueList.length === 0) {
        this.$message.warning("属性值不能为空");
        return;
      }
      console.log("整理好的参数", formData);
      try {
        // 发送请求
        const res = await this.$API.attrs.addAttrInfo(formData);
        if (res.code === 200) {
          this.$message.success("添加属性成功");
          this.isShowAddAttrs = false;
          this.getAttrList();
        }
      } catch (error) {
        console.log(error);
        this.$message.error("添加属性失败");
      }
    },
    // 删除属性
    async delAttrs(id) {
      try {
        const res = await this.$API.attrs.deleteAttr(id);
        this.$message.success("删除成功");
        this.getAttrList();
      } catch (error) {
        console.log(error);
        this.$message.error("删除失败");
      }
    },
    // 删除不想添加的属性值
    delAttrValue(index) {
      const { formData } = this;
      // 删除属性
      formData.attrValueList.splice(index, 1);
    },
    // 切换为编辑模式
    toEdit(Value, index) {
      // 如果属性值有edit属性，则设置为true 没有则添加一个edit属性
      if (Value.hasOwnProperty("edit")) {
        Value.edit = true;
      } else {
        this.$set(Value, "edit", true);
      }
      // 自动聚焦
      this.$nextTick(() => {
        this.$refs[index].focus();
      });
    },
    // 切换为查看模式
    toList(Value) {
      // 如果值为空则返回
      if (Value.valueName.trim() === "") {
        this.$message.warning("属性名不能为空");
        Value.valueName = "";
        return;
      }
      // 如果当前输入与原有的重复了，还是编辑模式并提示
      const isRepeat =
        this.formData.attrValueList.filter(
          (item) => item.valueName === Value.valueName
        ).length > 1;
      if (isRepeat) {
        this.$message.warning("属性名不能重复");
        Value.valueName = "";
        return;
      }
      Value.edit = false;
    },
    // 拉取属性列表
    async getAttrList() {
      try {
        this.loading = true;
        const res = await this.$API.attrs.reqAttrs({
          category1Id: this.category1Id,
          category2Id: this.category2Id,
          category3Id: this.category3Id,
        });
        this.tableData = res.data;
        this.loading = false;
      } catch (error) {
        this.$message.error("获取属性列表数据失败");
        console.log(error);
      }
    },
    //   接收子组件传递过来的数据
    async categoryIdChange({ categoryId, level }) {
      // 接收子组件传递过来的id
      if (level === 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
        this.tableData = [];
      } else if (level === 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
        this.tableData = [];
      } else {
        this.category3Id = categoryId;
        this.getAttrList();
      }
    },
  },
};
</script>

<style lang="less" scoped></style>
