import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Easy to Use',
    Svg: () => null,
    description: 'Jen.js was designed from the ground up to be easily installed and used to get your web apps running in minutes.',
  },
  {
    title: 'Focus on What Matters',
    Svg: () => null,
    description: 'Jen.js lets you focus on building features, and handles routing, server-side rendering, and static generation for you.',
  },
  {
    title: 'Powered by JavaScript',
    Svg: () => null,
    description: 'Extend or customize your Jen.js apps while reusing components. Build fast, modern web apps with full flexibility.',
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
