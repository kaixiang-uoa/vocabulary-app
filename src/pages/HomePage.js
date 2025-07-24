import React from 'react';
import { Typography, Divider, Statistic, Row, Col, Card, Button } from 'antd';
import { BookOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';
import UnitList from '../components/UnitList';
import { getMasteredWords, getUnmasteredWords } from '../utils/wordUtils';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const masteredWords = getMasteredWords();
  const unmasteredWords = getUnmasteredWords();
  // calculate total words
  const totalWords = masteredWords.length + unmasteredWords.length;
  // calculate mastery rate
  const masteryRate = totalWords > 0 ? Math.round((masteredWords.length / totalWords) * 100) : 0;
  
  return (
    <div className="home-page">
      {/* language switch buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <Button size="small" onClick={() => i18n.changeLanguage('en')} style={{ 
          marginRight: 8,
          background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
          color: '#fff',
          borderRadius: 6,
          border: 'none',
          fontWeight: 500,
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s',
        }}>English</Button>
        <Button size="small" onClick={() => i18n.changeLanguage('zh')} style={{ 
          background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
          color: '#fff',
          borderRadius: 6,
          border: 'none',
          fontWeight: 500,
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s',
        }}>中文</Button>
      </div>
      <Title 
        level={1} 
        style={{
          fontSize: 32,
          fontWeight: 700,
          background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2,
          marginBottom: 24
        }}
      >
        {t('title')}
      </Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title={<span style={{fontWeight: 600, fontSize: 15, color: 'var(--neutral-500)'}}>{t('total_words') || 'Total Words'}</span>}
              value={totalWords}
              prefix={<BookOutlined />}
              valueStyle={{ fontWeight: 700, fontSize: 22, color: 'var(--neutral-900)' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={<span style={{fontWeight: 600, fontSize: 15, color: 'var(--neutral-500)'}}>{t('mastered') || 'Mastered'}</span>}
              value={masteredWords.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ fontWeight: 700, fontSize: 22, color: 'var(--success-600)' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={<span style={{fontWeight: 600, fontSize: 15, color: 'var(--neutral-500)'}}>{t('mastery_rate') || 'Mastery Rate'}</span>}
              value={masteryRate}
              suffix="%"
              prefix={<SyncOutlined />}
              valueStyle={{ fontWeight: 700, fontSize: 22, color: masteryRate > 80 ? 'var(--success-600)' : masteryRate > 50 ? 'var(--warning-600)' : 'var(--error-600)' }}
            />
          </Card>
        </Col>
      </Row>
      <div style={{ marginTop: 32, marginBottom: 16 }}>
        <Divider 
          orientation="left" 
          style={{ fontSize: 20, fontWeight: 700, color: '#1890ff', marginBottom: 0 }}
        >
          <BookOutlined style={{ marginRight: 8 }} />{t('unit_list')}
        </Divider>
      </div>
      <UnitList />
    </div>
  );
};

export default HomePage;