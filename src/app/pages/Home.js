// @ts-check

import { html, PageComponent } from "../config/component.js";
import { css } from "../config/styles.js";
import { dataModel } from "../model/Data.js";

class Home extends PageComponent {
  
  render() {
    return html`
      <div class="home">
        <div class="title">
          아이엠파인 SD팀 지원자 권해솔
        </div>

        <div style="height: 36px;"></div>

        <app-divider></app-divider>

        <div style="height: 72px;"></div>

        <div class="contents">
          <app-container>
            <app-container-title>
              Graph UI
            </app-container-title>
  
            <app-container-content>
              <app-graph chart-type-list="bar"></app-graph>
            </app-container-content>
          </app-container>

          <app-container>
            <app-container-title>
              Modify Data via Eidtor
            </app-container-title>
  
            <app-container-content>
              <div class="table-container">
                <app-data-table></app-data-table>
              </div>
            </app-container-content>
            
            <app-container-footer>
              <app-editor></app-editor>
            </app-container-footer>
          </app-container>

          <app-container>
            <app-container-title>
              Modify Data via Raw Editor
            </app-container-title>
  
            <app-container-content>
              <app-raw-editor></app-raw-editor>
            </app-container-content>
          </app-container>
        </div>

        <div style="height: 72px;"></div>
      </div>
    `;
  }

  styles = css`
    .home {
      max-width: var(--screen-xl);
      margin: auto;
      padding: 48px;
    }

    .title {
      width: 100%;
      display: flex;
      justify-content: end;
      font-weight: bold;
      font-size: 15px;
    }

    .contents {
      display: grid;
      grid-template-columns: 50%;
      gap: 24px;
    }

    .contents app-container:last-child {
      grid-column: 1/3;
    }

    .table-container {
      padding: 48px 18px;
      border-radius: 12px;
      background-color: var(--white);
    }

    @media (max-width: 1100px) {
      .contents {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
    }
  `;

  afterRenderFirst() {
    // init data
    dataModel.set([
      {
        key: "Jan",
        val: 12
      },
      {
        key: "Feb",
        val: -76
      },
      {
        key: "Mar",
        val: 32
      },
      {
        key: "Apr",
        val: 123
      },
      {
        key: "May",
        val: 23
      },
    ]);
  }
}

customElements.define('app-page-home', Home);
