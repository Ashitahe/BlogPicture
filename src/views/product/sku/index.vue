  <template>
  <div>
    <!-- 展示表格 -->
    <el-table :data="skuList" style="width: 100%" border v-loading="loading">
      <el-table-column type="index" label="序号" width="50" align="center">
      </el-table-column>
      <el-table-column label="名称" align="center" width="100" prop="skuName">
      </el-table-column>
      <el-table-column label="描述" align="center" prop="skuDesc">
      </el-table-column>
      <el-table-column label="默认图片" width="100" align="center">
        <template slot-scope="{ row }">
          <img :src="row.skuDefaultImg" style="width: 80px; height: 80px" />
        </template>
      </el-table-column>
      <el-table-column label="重量(KG)" align="center" prop="weight">
      </el-table-column>
      <el-table-column label="价格(元)" align="center" width="80" prop="price">
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="{ row }">
          <HitButton
            title="上架"
            type="success"
            icon="el-icon-top"
            size="mini"
            v-if="!row.isSale"
            @click="racking(row)"
          ></HitButton>
          <HitButton
            title="下架"
            type="warning"
            icon="el-icon-bottom"
            size="mini"
            v-else
            @click="unShelve(row)"
          ></HitButton>
          <HitButton
            title="查看详情"
            type="info"
            icon="el-icon-info"
            size="mini"
            @click="moreInfo(row)"
          ></HitButton>
          <el-popconfirm
            :title="`确定删除${row.skuName}吗？`"
            @onConfirm="confirmDelete(row)"
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
      @size-change="pageSizeChange"
      @current-change="getSkuList"
      :current-page.sync="page"
      :page-sizes="[5, 10, 20, 50]"
      :page-size="limit"
      layout=" prev, pager, next, jumper,->,sizes,total"
      :total="total"
      style="text-align: center"
      background
    >
    </el-pagination>
    <!-- 侧边抽屉 -->
    <el-drawer
      :visible.sync="drawer"
      :with-header="false"
      size="50%"
      class="sku-list"
    >
      <el-row>
        <el-col :span="5">名称</el-col>
        <el-col :span="16">{{ skuInfo.skuName }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">描述</el-col>
        <el-col :span="16">{{ skuInfo.skuDesc }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">价格</el-col>
        <el-col :span="16">{{ skuInfo.price }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">平台属性</el-col>
        <el-col :span="16">
          <el-tag
            type="success"
            style="margin-right: 5px"
            v-for="attr in skuInfo.skuAttrValueList"
            :key="attr.id"
            >{{ `${attr.attrId}-${attr.valueId}` }}</el-tag
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="5">商品图片</el-col>
        <el-col :span="16">
          <el-carousel class="sku-carousel" trigger="click" height="400px">
            <el-carousel-item
              v-for="item in skuInfo.skuImageList"
              :key="item.id"
            >
              <img :src="item.imgUrl" />
            </el-carousel-item>
          </el-carousel>
        </el-col>
      </el-row>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: "",
  data() {
    return {
      skuList: [], // sku列表
      loading: false, // 加载动画
      drawer: false, // 侧边抽屉显示
      direction: "rtl", // 抽屉出现的方式
      drawerTitle: "", // 侧边抽屉的标题
      skuInfo: {}, // sku详情数据
      //   分页器
      page: 1,
      limit: 5,
      total: 0,
    };
  },
  mounted() {
    this.getSkuList();
  },
  methods: {
    //   查看详情
    async moreInfo(row) {
      this.drawer = true;
      this.drawerTitle = row.skuName;
      this.loading = true;
      try {
        const res = await this.$API.sku.reqSkuInfo(row.id);
        if (res.code === 200) {
          console.log(res);
          this.skuInfo = res.data;
        }
      } catch (error) {
        this.$message.error(error);
      } finally {
        this.loading = false;
      }
    },
    //   上架
    async racking(row) {
      try {
        const res = await this.$API.sku.onSale(row.id);
        if (res.code === 200) {
          this.$message.success("上架成功");
          this.getSkuList(this.page);
        }
      } catch (error) {
        this.$message.error(error);
      }
    },
    // 下架 cancelSale
    async unShelve(row) {
      try {
        const res = await this.$API.sku.cancelSale(row.id);
        if (res.code === 200) {
          this.$message.success("下架成功");
          this.getSkuList(this.page);
        }
      } catch (error) {
        this.$message.error(error);
      }
    },

    //   删除sku的回调
    async confirmDelete(row) {
      try {
        const res = await this.$API.sku.deleteSku(row.id);
        if (res.code === 200) {
          this.getSkuList(this.page);
        }
      } catch (error) {
        this.$message({
          type: "error",
          message: error,
        });
      }
    },
    //   页面显示数量改变时的回调
    pageSizeChange(limit) {
      this.limit = limit;
      this.getSkuList();
    },

    // 初始化页面
    async getSkuList(page = 1) {
      this.page = page;
      this.loading = true;
      try {
        const res = await this.$API.sku.reqSkuByPage(page, this.limit);
        console.log(res);
        if (res.code === 200) {
          const { data } = res;
          this.page = data.current;
          this.total = data.total;
          this.skuList = data.records;
        }
      } catch (error) {
        this.$message.error(error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>


<style lang="scss" scoped>
/* 
    1. 为什么必须加 /deep/ 或者 ::v-deep 才能修改Carousel组件的样式?, 
      声明了scoped, 不用deep不能修改子组件的非标签样式(也就是Carousel组件内部的子标签样式)
      用了deep: 不会对目标标签有当前组件的data属性选择的要求
    2. 为什么不加/deep/能修改Row/Col组件的样式?
      我们修改的是Row/Col根标签样式(它有当前组件的data属性)
  */
.sku-list {
  .el-row {
    height: 40px;
    .el-col {
      line-height: 40px;
      &.el-col-5 {
        font-size: 18px;
        font-weight: bold;
        text-align: right;
        margin-right: 20px;
      }
    }
  }

  .sku-carousel {
    width: 400px;
    border: 1px solid #ccc;
    img {
      width: 400px;
      height: 400px;
    }
    ::v-deep .el-carousel__indicator {
      button {
        background-color: hotpink;
      }
      &.is-active {
        button {
          background-color: green;
        }
      }
    }
  }
}
</style>