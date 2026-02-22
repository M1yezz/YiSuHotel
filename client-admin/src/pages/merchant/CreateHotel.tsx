import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Card, message, InputNumber, Select, DatePicker, Upload, Modal, Alert } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

dayjs.locale('zh-cn');

const { Option } = Select;
const { TextArea } = Input;

// 模拟上传函数（实际项目中应替换为真实上传接口）
// 暂时返回一个占位图或 base64
const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const CreateHotel: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // 门店照片 (单张)
  const [fileListStore, setFileListStore] = useState<UploadFile[]>([]);
  // 宣传照片 (多张)
  const [fileListImages, setFileListImages] = useState<UploadFile[]>([]);

  // 地图相关状态
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerInstance, setMarkerInstance] = useState<any>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  // 初始化高德地图
  useEffect(() => {
    // 设置安全密钥
    (window as any)._AMapSecurityConfig = {
        securityJsCode: '9fdb75216fffd90c4365cd8a11ae714d', 
    };

    // 检查是否已经加载过高德地图脚本
    if (!(window as any).AMap) {
        const loader = document.createElement('script');
        loader.src = 'https://webapi.amap.com/maps?v=2.0&key=2151941a876875f2677ecb1a07827377&plugin=AMap.PlaceSearch,AMap.AutoComplete,AMap.Geocoder,AMap.ToolBar'; 
        loader.async = true;
        loader.onload = initMap;
        loader.onerror = () => message.error('高德地图加载失败，请检查网络或Key配置');
        document.head.appendChild(loader);
    } else {
        initMap();
    }

    return () => {
        if (mapInstance) {
            mapInstance.destroy();
        }
    };
  }, []);

  const initMap = () => {
      if (!(window as any).AMap || !mapContainerRef.current) return;
      const AMap = (window as any).AMap;

      const map = new AMap.Map(mapContainerRef.current, {
          zoom: 11,
          center: [116.397428, 39.90923], // 默认中心点：北京天安门
          resizeEnable: true
      });
      
      map.addControl(new AMap.ToolBar());

      const marker = new AMap.Marker({
          draggable: true,
          cursor: 'move',
          position: map.getCenter() 
      });
      marker.setMap(map);
      setMarkerInstance(marker);
      setMapInstance(map);

      // 绑定点击地图事件
      map.on('click', (e: any) => {
          const lnglat = e.lnglat;
          updatePosition(lnglat.getLng(), lnglat.getLat(), AMap, marker);
      });

      // 绑定 marker 拖拽结束事件
      marker.on('dragend', (e: any) => {
          const lnglat = e.lnglat;
          updatePosition(lnglat.getLng(), lnglat.getLat(), AMap, marker);
      });

      // 地址输入提示
      const auto = new AMap.AutoComplete({
          input: "address-input"
      });
      
      const placeSearch = new AMap.PlaceSearch({
          map: map
      });

      auto.on("select", (e: any) => {
          // 如果 poi 本身包含位置信息，直接定位
          if (e.poi.location) {
              map.setZoom(15);
              map.setCenter(e.poi.location);
              updatePosition(e.poi.location.lng, e.poi.location.lat, AMap, marker);
          } else {
              // 否则通过 placeSearch 获取详细信息
              placeSearch.setCity(e.poi.adcode);
              placeSearch.search(e.poi.name, (status: string, result: any) => {
                   if (status === 'complete' && result.info === 'OK') {
                       // 搜索成功，取第一个结果的位置
                       const poi = result.poiList.pois[0];
                       if (poi && poi.location) {
                           map.setZoom(15);
                           map.setCenter(poi.location);
                           updatePosition(poi.location.lng, poi.location.lat, AMap, marker);
                       }
                   }
              });
          }
      });
  };

  const updatePosition = (lng: number, lat: number, AMap: any, marker: any) => {
      setLongitude(lng);
      setLatitude(lat);
      marker.setPosition([lng, lat]);
      // 反向地理编码获取地址（可选，覆盖输入框）
      const geocoder = new AMap.Geocoder();
      geocoder.getAddress([lng, lat], (status: string, result: any) => {
          if (status === 'complete' && result.regeocode) {
              const address = result.regeocode.formattedAddress;
              form.setFieldsValue({ address: address });
          }
      });
  };

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const handleChangeStore: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setFileListStore(newFileList);

  const handleChangeImages: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setFileListImages(newFileList);

  // 上传文件到服务器的辅助函数
  const uploadFile = async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append('file', file);
      try {
          // 使用 axios client 上传，自动带上 token（如果有）
          const response = await client.post('/upload', formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });
          return response.data.url;
      } catch (error) {
          console.error('Upload failed:', error);
          throw error;
      }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // 1. 处理门店照片 (单张)
      let storeImgUrl = '';
      if (fileListStore.length > 0) {
          const file = fileListStore[0];
          if (file.originFileObj) {
              storeImgUrl = await uploadFile(file.originFileObj as File);
          } else if (file.url) {
              storeImgUrl = file.url;
          }
      }
          
      // 2. 处理宣传照片 (多张)
      const imagesUrls = await Promise.all(fileListImages.map(async file => {
          if (file.originFileObj) {
              return await uploadFile(file.originFileObj as File);
          }
          return file.url || '';
      }));

      // 过滤掉空字符串（如果有上传失败的）
      const validImagesUrls = imagesUrls.filter(url => !!url);

      const payload = {
          ...values,
          openingDate: values.openingDate ? values.openingDate.format('YYYY-MM-DD') : undefined,
          storeImg: storeImgUrl,
          images: validImagesUrls,
          latitude: latitude, // 传入经纬度
          longitude: longitude,
          // 显式添加 merchantId，确保酒店能关联到当前用户
          merchant: { id: localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : undefined },
          merchantId: localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : undefined 
      };
      
      const { data } = await client.post('/hotels', payload);
      message.success('酒店创建成功，请添加房型！');
      navigate(`/merchant/hotels/${data.id}/rooms`);
    } catch (error) {
      console.error(error);
      message.error('创建酒店失败');
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );

  return (
    <Card title="创建新酒店">
      <Form layout="vertical" onFinish={onFinish} form={form}>
        <Form.Item name="name" label="酒店名称" rules={[{ required: true, message: '请输入酒店名称' }]}>
          <Input placeholder="例如：君悦酒店" />
        </Form.Item>
        
        <Form.Item name="address" label="地址" rules={[{ required: true, message: '请输入酒店地址' }]} help="在下方地图搜索地址，点击地图可修正定位">
          <Input id="address-input" placeholder="请输入关键字搜索地址..." />
        </Form.Item>

        {/* 地图容器 */}
        <div style={{ marginBottom: 24, border: '1px solid #d9d9d9', borderRadius: 4 }}>
            <div ref={mapContainerRef} style={{ width: '100%', height: '300px' }} />
            <div style={{ padding: 8, background: '#f5f5f5', fontSize: 12 }}>
                当前定位：经度 {longitude || '-'}，纬度 {latitude || '-'}
            </div>
        </div>

        <Form.Item name="type" label="酒店类型" rules={[{ required: true, message: '请选择酒店类型' }]}>
          <Select placeholder="请选择酒店类型">
            <Option value="domestic">国内</Option>
            <Option value="overseas">海外</Option>
            <Option value="homestay">民宿</Option>
          </Select>
        </Form.Item>

        <Form.Item name="openingDate" label="开业日期" rules={[{ required: true, message: '请选择开业日期' }]}>
           <DatePicker style={{ width: '100%' }} placeholder="选择开业日期" locale={locale} />
        </Form.Item>

        <Form.Item label="门店照片" required tooltip="请上传一张门店封面图">
           <Upload
              listType="picture-card"
              fileList={fileListStore}
              onPreview={handlePreview}
              onChange={handleChangeStore}
              beforeUpload={() => false} // 阻止自动上传，改为手动随表单提交
              maxCount={1}
              accept="image/*"
            >
              {fileListStore.length >= 1 ? null : uploadButton}
            </Upload>
        </Form.Item>

        <Form.Item label="宣传照片" required tooltip="请上传多张酒店宣传图">
           <Upload
              listType="picture-card"
              fileList={fileListImages}
              onPreview={handlePreview}
              onChange={handleChangeImages}
              beforeUpload={() => false}
              accept="image/*"
              multiple
            >
              {fileListImages.length >= 8 ? null : uploadButton}
            </Upload>
        </Form.Item>

        <Form.Item name="starRating" label="星级" rules={[{ required: true, message: '请选择酒店星级' }]}>
           <InputNumber min={1} max={5} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="description" label="描述">
           <TextArea rows={4} />
        </Form.Item>

        <Form.Item name="facilities" label="设施">
           <Select mode="tags" placeholder="输入并回车（例如：Wifi, 泳池）">
               <Option value="Wifi">无线网络</Option>
               <Option value="Parking">停车场</Option>
               <Option value="Pool">游泳池</Option>
               <Option value="Gym">健身房</Option>
           </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            下一步：保存并管理房型
          </Button>
        </Form.Item>
      </Form>
      
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Card>
  );
};

export default CreateHotel;
