import target from '../results'
import * as sut from '../../actions/complaints'

describe('reducer:results', () => {
  it('has a default state', () => {
    expect(target(undefined, {})).toEqual({
        activeCall: '',
        error: '',
        isLoading: false,
        items: []
      })
  })

  describe( 'Complaints', () => {
    describe( 'handles COMPLAINTS_API_CALLED actions', () => {
      const action = {
        type: sut.COMPLAINTS_API_CALLED,
        url: 'http://www.example.org'
      }
      expect( target( {}, action ) ).toEqual( {
        activeCall: 'http://www.example.org',
        isLoading: true
      } )
    } )

    describe( 'handles COMPLAINTS_RECEIVED actions', () => {
      let action

      beforeEach( () => {
        action = {
          type: sut.COMPLAINTS_RECEIVED,
          data: {
            hits: {
              hits: [
                { _source: { a: '123' } },
                { _source: { a: '456' } }
              ],
              total: 2
            },
            '_meta': {
              total_record_count: 162576,
              last_updated: '2017-07-10T00:00:00.000Z',
              last_indexed: '2017-07-11T00:00:00.000Z',
              license: 'CC0'
            }
          }
        }
      } )

      it( 'extracts the important data from inside the returned data', () => {
        expect( target( { error: 'foo' }, action ) ).toEqual( {
          activeCall: '',
          error: '',
          isLoading: false,
          items: [
            { a: '123' },
            { a: '456' }
          ]
        } )
      } )

      it( 'replaces text with highlighted text if it exists', () => {
        action.data.hits.hits[0].highlight = { a: [ '<em>123</em>' ] }

        expect( target( { error: 'foo' }, action ) ).toEqual( {
          activeCall: '',
          error: '',
          isLoading: false,
          items: [
            { a: '<em>123</em>' },
            { a: '456' }
          ]
        } )
      } )
    } )

    it( 'handles COMPLAINTS_FAILED actions', () => {
      const action = {
        type: sut.COMPLAINTS_FAILED,
        error: 'foo bar'
      }
      expect( target( {
        items: [ 1, 2, 3 ]
      }, action ) ).toEqual( {
        activeCall: '',
        error: 'foo bar',
        isLoading: false,
        items: []
      } )
    } )
  } )
})
