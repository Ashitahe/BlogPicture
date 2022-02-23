<template>
  <el-form
    :inline="true"
    :disabled="disabled"
    :model="formInline"
    class="demo-form-inline"
  >
    <el-form-item label="一级分类">
      <el-select v-model="formInline.category1Id" placeholder="请选择">
        <el-option
          :label="cate1.name"
          :value="cate1.id"
          v-for="cate1 in category1List"
          :key="cate1.id"
          @click.native="getCate2List"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="二级分类">
      <el-select v-model="formInline.category2Id" placeholder="请选择">
        <el-option
          :label="cate2.name"
          :value="cate2.id"
          v-for="cate2 in category2List"
          :key="cate2.id"
          @click.native="getCate3List"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="三级分类">
      <el-select v-model="formInline.category3Id" placeholder="请选择">
        <el-option
          :label="cate3.name"
          :value="cate3.id"
          v-for="cate3 in category3List"
          :key="cate3.id"
          @click.native="getAttrs"
        ></el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "CategorySelector",
  props: ["disabled"],
  data() {
    return {
      formInline: {
        category1Id: "",
        category2Id: "",
        category3Id: "",
      },
      category1List: [],
      category2List: [],
      category3List: [],
    };
  },
  mounted() {
    this.getCate1List();
  },
  methods: {
    //   获取一级分类列表
    async getCate1List() {
      try {
        const res = await this.$API.categorySelector.reqCate1List();
        if (res.code === 200) {
          this.category1List = res.data;
        }
      } catch (error) {
        this.$message.error("获取一级分类列表失败");
      }
    },
    // 获取二级分类列表
    async getCate2List() {
      try {
        //   清空原始数据
        this.formInline.category2Id = "";
        this.category2List = [];
        this.formInline.category3Id = "";
        this.category3List = [];
        // 传递1级id给父组件
        this.$emit("categoryIdChange", {
          categoryId: this.formInline.category1Id,
          level: 1,
        });
        const res = await this.$API.categorySelector.reqCate2List(
          this.formInline.category1Id
        );
        if (res.code === 200) {
          this.category2List = res.data;
        }
      } catch (error) {
        this.$message.error("获取二级分类列表失败");
      }
    },
    // 获取三级分类列表
    async getCate3List() {
      try {
        //   清空原始列表数据
        this.formInline.category3Id = "";
        this.category3List = [];
        // 传递id给父组件
        this.$emit("categoryIdChange", {
          categoryId: this.formInline.category2Id,
          level: 2,
        });
        const res = await this.$API.categorySelector.reqCate3List(
          this.formInline.category2Id
        );
        if (res.code === 200) {
          this.category3List = res.data;
        }
      } catch (error) {
        this.$message.error("获取三级分类列表失败");
      }
    },
    // 获取属性值
    getAttrs() {
      this.$emit("categoryIdChange", {
        categoryId: this.formInline.category3Id,
        level: 3,
      });
    },
  },
};
</script>

<style lang='less' scoped>
</style>