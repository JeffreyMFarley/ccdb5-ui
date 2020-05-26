import configureMockStore from 'redux-mock-store'
import { mapStateToProps, BrushChart } from '../components/Charts/BrushChart'
import { mount, shallow } from 'enzyme'
import { Provider } from 'react-redux'
import React from 'react'
import renderer from 'react-test-renderer'
import thunk from 'redux-thunk'

// this is how you override and mock an imported constructor
jest.mock( 'britecharts', () => {
  const props = [
    'brush', 'margin', 'backgroundColor', 'colorSchema', 'enableLabels',
    'labelsSize', 'labelsTotalCount', 'labelsNumberFormat', 'outerPadding',
    'percentageAxisToMaxRatio', 'yAxisLineWrapLimit',
    'yAxisPaddingBetweenChart', 'width', 'wrapLabels', 'height', 'on'
  ]

  const mock = {}

  for ( let i = 0; i < props.length; i++ ) {
    const propName = props[i]
    mock[propName] = jest.fn().mockImplementation( () => {
      return mock
    } )
  }

  return mock
} )

jest.mock( 'd3', () => {
  const props = [
    'select', 'each', 'node', 'getBoundingClientRect', 'width', 'datum', 'call',
    'remove', 'selectAll'
  ]

  const mock = {}

  for ( let i = 0; i < props.length; i++ ) {
    const propName = props[i]
    mock[propName] = jest.fn().mockImplementation( () => {
      return mock
    } )
  }

  // set narrow width value for 100% test coverage
  mock.width = 100

  return mock
} )

function setupSnapshot() {
  const middlewares = [ thunk ]
  const mockStore = configureMockStore( middlewares )
  const store = mockStore( {} )

  return renderer.create(
    <Provider store={ store }>
      <BrushChart aggtype={'foo'}
                  brushDateData={[]}
                  dateRange={[]}/>
    </Provider>
  )
}

describe( 'component: BrushChart', () => {
  describe( 'initial state', () => {
    it( 'renders without crashing', () => {
      const target = setupSnapshot()
      let tree = target.toJSON()
      expect( tree ).toMatchSnapshot()
    } )
  } )

  describe( 'componentDidUpdate', () => {
    let mapDiv

    beforeEach( () => {
      mapDiv = document.createElement( 'div' )
      mapDiv.setAttribute( 'id', 'brush-chart-foo' )
      window.domNode = mapDiv
      document.body.appendChild( mapDiv )
    } )

    afterEach( () => {
      const div = document.getElementById( 'brush-chart-foo' )
      if ( div ) {
        document.body.removeChild( div )
      }
      jest.clearAllMocks()
    } )

    it( 'does nothing when no data', () => {
      const target = shallow( <BrushChart data={ [] } aggtype={'foo'}/> )
      target._redrawChart = jest.fn()
      target.setProps( { data: [] } )
      expect(  target._redrawChart ).toHaveBeenCalledTimes( 0 )
    } )

    it( 'trigger a new update when data changes', () => {
      const target = shallow( <BrushChart data={ [ 23, 4, 3 ] } aggtype={'foo'} total={1000}/> )
      target._redrawChart = jest.fn()
      const sp = jest.spyOn(target.instance(), '_redrawChart')
      target.setProps( { data: [ 2, 5 ] } )
      expect( sp ).toHaveBeenCalledTimes( 1 )
    } )

    it( 'trigger a new update when printMode changes', () => {
      const target = shallow( <BrushChart data={ [ 23, 4, 3 ] }
                                        aggtype={'foo'} total={1000}
                                        printMode={'false'}
      /> )
      target._redrawChart = jest.fn()
      const sp = jest.spyOn(target.instance(), '_redrawChart')
      target.setProps( { printMode: true } )
      expect( sp ).toHaveBeenCalledTimes( 1 )
    } )

    it( 'trigger a new update when width changes', () => {
      const target = shallow( <BrushChart data={ [ 23, 4, 3 ] }
                                        aggtype={'foo'} total={1000}
                                        printMode={'false'}
                                        width={1000}
      /> )
      target._redrawChart = jest.fn()
      const sp = jest.spyOn(target.instance(), '_redrawChart')
      target.setProps( { width: 600 } )
      expect( sp ).toHaveBeenCalledTimes( 1 )
    } )
  } )

  describe( 'mapStateToProps', () => {
    it( 'maps state and props', () => {
      const state = {
        aggs: {
          total: 100
        },
        map: {
          results: {
            baz: [ 1, 2, 3 ]
          }
        },
        query: {
          baz: [ 1, 2, 3 ]
        },
        trends: {
          results: {
            baz: [ 1, 2, 3 ]
            // tbd add dateRangeBrush
          }
        },
        view: {
          printMode: false
        }
      }
      const ownProps = {
        aggtype: 'baz'
      }
      let actual = mapStateToProps( state, ownProps )
      expect( actual ).toEqual( {
        brushDateData: undefined,
        dateRange: [ undefined, undefined ]
      } )
    } )
  } )
} )
