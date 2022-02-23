<template>
  <div>
    <el-card>
      <CategorySelector
        @categoryIdChange="categoryIdChange"
        :disabled="isShowAddSpu || isShowAddSku"
      ></CategorySelector>
    </el-card>

    <el-card style="margin: 20px 0">
      <!-- 展示spu页面 -->
      <div v-show="!isShowAddSpu && !isShowAddSku">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="showSpuAddPage(false)"
          :disabled="category3Id === null"
          >添加SPU</el-button
        >
        <el-table
          :data="spuList"
          border
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column
            type="index"
            label="序号"
            width="80"
            align="center"
          ></el-table-column>
          <el-table-column label="SPU名称" prop="spuName"> </el-table-column>
          <el-table-column label="SPU描述" prop="description"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ row }">
              <HitButton
                title="添加sku"
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="showSkuAddPage(row)"
              ></HitButton>
              <HitButton
                title="修改spu"
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showSpuAddPage(row)"
              ></HitButton>

              <HitButton
                title="查看SKU列表"
                type="info"
                icon="el-icon-info"
                size="mini"
                @click="allSku(row)"
              ></HitButton>
              <el-popconfirm
                :title="`你确认要删除${row.spuName}吗?`"
                @onConfirm="deleleSpu(row.id)"
              >
                <HitButton
                  title="删除"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  slot="reference"
                ></HitButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页器 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="getSpuList"
          :current-page="page"
          :page-sizes="[5, 7, 9]"
          :page-size="limit"
          layout=" prev, pager, next, jumper,->, sizes,total"
          :total="total"
          style="text-align: center"
        >
        </el-pagination>
      </div>
      <!-- 添加spu页面 -->
      <SpuForm
        v-show="isShowAddSpu"
        ref="spuForm"
        :visible.sync="isShowAddSpu"
        @success="handleSuccess"
        @cancel="handleCancel"
      ></SpuForm>
      <!-- 添加sku页面 -->
      <SkuForm
        v-show="isShowAddSku"
        ref="skuForm"
        :visible.sync="isShowAddSku"
        @success="handleSkuSuccess"
        @skuBack="skuBack"
      ></SkuForm>
    </el-card>
    <el-dialog
      :title="`${spuName}的SKU列表`"
      :visible.sync="dialogTableVisible"
    >
      <el-table :data="skuList">
        <el-table-column
          label="名称"
          prop="skuName"
          align="center"
        ></el-table-column>
        <el-table-column
          label="价格(元)"
          prop="price"
          align="center"
        ></el-table-column>
        <el-table-column
          label="重量(KG)"
          prop="weight"
          align="center"
        ></el-table-column>
        <el-table-column label="默认图片" align="center">
          <template slot-scope="{ row }">
            <img :src="row.skuDefaultImg" style="width: 150px; height: 150px" />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import SpuForm from "./spuForm";
import SkuForm from "./skuForm";
export default {
  name: "",
  components: {
    SpuForm,
    SkuForm,
  },
  data() {
    return {
      dialogTableVisible: false, // 控制查看sku对话框显示
      isShowAddSku: false, // 控制添加sku页面显示
      isShowAddSpu: false, // 控制添加spu页面的显示
      loading: false, // 控制加载进度条显示
      spuName: "", // sku查看对话框的spu名称

      spuList: [], // spu列表
      skuList: [], // sku列表
      // 三个分类列表id
      category1Id: null,
      category2Id: null,
      category3Id: null,
      // 分页器控制
      page: 1,
      limit: 5,
      total: 0,
    };
  },

  methods: {
    // 查看spu下的所有sku
    async allSku(spu) {
      try {
        this.spuName = spu.spuName;
        const res = await this.$API.sku.reqAllSkuInfo(spu.id);
        if (res.code === 200) {
          this.skuList = res.data;
          // 显示对话框
          this.dialogTableVisible = true;
        }
      } catch (error) {
        this.$message.error(error);
      }
    },
    // sku取消的回调
    skuBack() {
      console.log("sku添加取消");
    },
    // sku添加成功的回调
    handleSkuSuccess() {
      this.getSpuList(this.page);
    },
    // sku显示
    showSkuAddPage(row) {
      this.isShowAddSku = true;
      // 整理要传递给sku页面的参数
      const skuInfo = {
        category1Id: this.category1Id,
        category2Id: this.category2Id,
        category3Id: this.category3Id,
        spu: row,
      };
      this.$refs.skuForm.init(skuInfo);
    },
    // spu添加or修改成功
    handleSuccess() {
      // 重新获取spu列表
      this.getSpuList(this.spuId ? this.page : 1);
      this.spuId = null;
    },
    // spu添加or修改取消
    handleCancel() {
      this.spuId = null;
    },
    //   显示添加spu页面
    showSpuAddPage(spu) {
      this.isShowAddSpu = true;
      // console.log(spu);
      // 添加按钮跳转进spu页面
      if (!spu) {
        this.$refs.spuForm.initAddSpu(this.category3Id);
        return;
      }
      // 修改按钮跳转进spu页面
      this.$refs.spuForm.initUpdateSpu(spu.id);
    },

    //   获取三级分类列表传递过来的id
    categoryIdChange({ categoryId, level }) {
      //   得到从三级分类列表传来的id
      //   this.categoryId = categoryId;
      if (level === 1) {
        this.category1Id = categoryId;
        this.category2Id = null;
        this.category3Id = null;
      } else if (level === 2) {
        this.category2Id = categoryId;
        this.category3Id = null;
      } else {
        this.category3Id = categoryId;
        this.getSpuList();
      }
    },
    // 删除spu
    async deleleSpu(id) {
      try {
        const res = await this.$API.spu.delSpu(id);
        if (res.code === 200) {
          this.$message.success("删除成功");
          this.getSpuList();
        }
      } catch (error) {
        console.log(error);
        this.$message.error(error);
      }
    },
    // 获取spu列表
    async getSpuList(page = 1) {
      this.loading = true;
      this.page = page;
      try {
        const res = await this.$API.spu.reqList(
          page,
          this.limit,
          this.category3Id
        );
        if (res.code === 200) {
          const { data } = res;
          this.spuList = data.records;
          this.total = data.total;
        }
        this.loading = false;
      } catch (error) {
        console.log(error);
      }
    },
    // 一页显示数量改变的回调
    handleSizeChange(limit) {
      this.limit = limit;
      this.getSpuList(this.page);
    },
  },
};
</script>