/* global jest, test, expect */

import React, { Component } from 'react';
import { render, screen } from '@testing-library/react';
import injectorContext from 'lib/dependency-injection/injectorContext';
import historyViewerConfig from '../HistoryViewerConfig';

const mockHistoryViewer = jest.fn((props) => {
  const { config, schemaUrl, HistoryViewer: HistoryViewerProp, ...otherProps } = props;
  return (
    <div
      data-testid="history-viewer"
      data-config={JSON.stringify(config)}
      data-schema-url={schemaUrl}
      data-props={JSON.stringify(otherProps)}
      data-history-viewer={typeof HistoryViewerProp === 'function' ? 'exists' : 'missing'}
    />
  );
});

const provideTestInjector = (Injectable) => {
  class InjectorProvider extends Component {
    getChildContext() {
      return {
        injector: {
          get: jest.fn(item => item),
          validate: item => item,
          context: 'DefaultContext',
        },
      };
    }

    render() {
      return <Injectable {...this.props} />;
    }
  }
  InjectorProvider.childContextTypes = injectorContext;
  return InjectorProvider;
};

// Suppress legacy context warning in tests
// eslint-disable-next-line no-console
const originalError = console.error;
beforeAll(() => {
  // eslint-disable-next-line no-console
  console.error = jest.fn((...args) => {
    // "legacy childContextTypes API" is related to class components which will be refactored away
    // "An update to Popper inside a test" relates to the "use act() warning" from react-testing-library
    if (args[0]?.includes?.('legacy childContextTypes API') || args[0]?.includes?.('An update to Popper inside a test')) {
      return;
    }
    originalError.call(console, ...args);
  });
});

afterAll(() => {
  // eslint-disable-next-line no-console
  console.error = originalError;
});

function makeProps(obj = {}) {
  return {
    compare: false,
    recordId: 123,
    recordClass: 'TestClass',
    ...obj
  };
}

function setupWindowConfig() {
  const sectionKey = 'SilverStripe\\VersionedAdmin\\Controllers\\HistoryViewerController';
  window.ss.config = {
    SecurityID: 1234567890,
    sections: [
      {
        name: sectionKey,
        form: {
          versionForm: {
            schemaUrl: '/admin/schema/version',
          },
          compareForm: {
            schemaUrl: '/admin/schema/compare',
          }
        },
      },
    ],
  };
}

beforeEach(() => {
  setupWindowConfig();
});

test('HistoryViewerConfig wraps the HistoryViewer component', () => {
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  render(
    <WrappedComponent {...makeProps()} />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  expect(historyViewer).not.toBeNull();
});

test('HistoryViewerConfig passes config from Config.getSection to wrapped component', () => {
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  render(
    <WrappedComponent {...makeProps()} />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  const config = JSON.parse(historyViewer.getAttribute('data-config'));
  expect(config.form.versionForm.schemaUrl).toBe('/admin/schema/version');
  expect(config.form.compareForm.schemaUrl).toBe('/admin/schema/compare');
});

test('HistoryViewerConfig generates correct schema URL for version form without compare', () => {
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  render(
    <WrappedComponent {...makeProps({ compare: false })} />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  const schemaUrl = historyViewer.getAttribute('data-schema-url');
  expect(schemaUrl).toBe('/admin/schema/version/:id?RecordVersion=:version&RecordClass=:class&RecordID=:id');
});

test('HistoryViewerConfig generates correct schema URL for compare form with compare enabled', () => {
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  render(
    <WrappedComponent {...makeProps({ compare: true })} />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  const schemaUrl = historyViewer.getAttribute('data-schema-url');
  expect(schemaUrl).toBe('/admin/schema/compare/:id?RecordVersionFrom=:from&RecordVersionTo=:to&RecordClass=:class&RecordID=:id');
});

test('HistoryViewerConfig passes through all props to wrapped component', () => {
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  const testProps = makeProps({
    recordId: 456,
    recordClass: 'AnotherClass',
    limit: 50,
  });
  render(
    <WrappedComponent {...testProps} />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  const props = JSON.parse(historyViewer.getAttribute('data-props'));
  expect(props.recordId).toBe(456);
  expect(props.recordClass).toBe('AnotherClass');
  expect(props.limit).toBe(50);
  expect(props.compare).toBe(false);
});

test('HistoryViewerConfig passes HistoryViewer component as prop to wrapped component', () => {
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  render(
    <WrappedComponent {...makeProps()} />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  expect(historyViewer.getAttribute('data-history-viewer')).toBe('exists');
});

test('HistoryViewerConfig correctly identifies compare mode when compare is true object', () => {
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  render(
    <WrappedComponent {...makeProps({
      compare: {
        versionFrom: { version: 1 },
        versionTo: { version: 2 }
      }
    })}
    />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  const schemaUrl = historyViewer.getAttribute('data-schema-url');
  expect(schemaUrl).toContain('RecordVersionFrom=:from');
  expect(schemaUrl).toContain('RecordVersionTo=:to');
});

test('HistoryViewerConfig correctly identifies non-compare mode when compare is false object', () => {
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  render(
    <WrappedComponent {...makeProps({
      compare: {}
    })}
    />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  const schemaUrl = historyViewer.getAttribute('data-schema-url');
  expect(schemaUrl).toContain('RecordVersionFrom=:from');
  expect(schemaUrl).toContain('RecordVersionTo=:to');
});

test('HistoryViewerConfig handles missing compare prop', () => {
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  const props = makeProps();
  delete props.compare;
  render(
    <WrappedComponent {...props} />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  const schemaUrl = historyViewer.getAttribute('data-schema-url');
  expect(schemaUrl).toContain('RecordVersion=:version');
});

test('HistoryViewerConfig uses getSchemaUrlDetails to build correct query parts for version form', () => {
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  render(
    <WrappedComponent {...makeProps({ compare: false })} />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  const schemaUrl = historyViewer.getAttribute('data-schema-url');
  expect(schemaUrl).toContain('RecordVersion=:version');
  expect(schemaUrl).toContain('RecordClass=:class');
  expect(schemaUrl).toContain('RecordID=:id');
});

test('HistoryViewerConfig uses getSchemaUrlDetails to build correct query parts for compare form', () => {
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  render(
    <WrappedComponent {...makeProps({ compare: true })} />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  const schemaUrl = historyViewer.getAttribute('data-schema-url');
  expect(schemaUrl).toContain('RecordVersionFrom=:from');
  expect(schemaUrl).toContain('RecordVersionTo=:to');
  expect(schemaUrl).toContain('RecordClass=:class');
  expect(schemaUrl).toContain('RecordID=:id');
});

test('HistoryViewerConfig builds schema URL with base path containing :id placeholder', () => {
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  render(
    <WrappedComponent {...makeProps()} />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  const schemaUrl = historyViewer.getAttribute('data-schema-url');
  expect(schemaUrl).toContain('/:id?');
});

test('HistoryViewerConfig returns a component that can be used as a React component', () => {
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  expect(WrappedComponent).toBeDefined();
  expect(typeof WrappedComponent).toBe('function');
  const { container } = render(
    <WrappedComponent {...makeProps()} />
  );
  expect(container.firstChild).not.toBeNull();
});

test('HistoryViewerConfig handles different schema URLs from config', () => {
  window.ss.config.sections[0].form.versionForm.schemaUrl = '/custom/schema/version/path';
  window.ss.config.sections[0].form.compareForm.schemaUrl = '/custom/schema/compare/path';
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  render(
    <WrappedComponent {...makeProps({ compare: false })} />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  const schemaUrl = historyViewer.getAttribute('data-schema-url');
  expect(schemaUrl).toContain('/custom/schema/version/path');
});

test('HistoryViewerConfig with compare enabled uses compareForm schemaUrl', () => {
  window.ss.config.sections[0].form.compareForm.schemaUrl = '/different/compare/schema';
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  render(
    <WrappedComponent {...makeProps({ compare: true })} />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  const schemaUrl = historyViewer.getAttribute('data-schema-url');
  expect(schemaUrl).toContain('/different/compare/schema');
});

test('HistoryViewerConfig maintains all props while adding config and schemaUrl', () => {
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  const customProps = {
    ...makeProps(),
    onSelect: jest.fn(),
    onSetPage: jest.fn(),
    currentVersion: { version: 5 },
    page: 2,
    limit: 25,
  };
  render(
    <WrappedComponent {...customProps} />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  const props = JSON.parse(historyViewer.getAttribute('data-props'));
  expect(props.currentVersion.version).toBe(5);
  expect(props.page).toBe(2);
  expect(props.limit).toBe(25);
});

test('HistoryViewerConfig getConfig returns correct section from window.ss.config', () => {
  const ConfiguredComponent = historyViewerConfig(mockHistoryViewer);
  const WrappedComponent = provideTestInjector(ConfiguredComponent);
  render(
    <WrappedComponent {...makeProps()} />
  );
  const historyViewer = screen.getByTestId('history-viewer');
  const config = JSON.parse(historyViewer.getAttribute('data-config'));
  expect(config).toBeDefined();
  expect(config.form).toBeDefined();
});
