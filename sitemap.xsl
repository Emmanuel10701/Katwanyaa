<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html>
      <head>
        <title>Katwanyaa School - Sitemap</title>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f7fa; color: #333; }
          .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); }
          h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 15px; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #3498db; color: white; padding: 15px; text-align: left; font-weight: 600; }
          td { padding: 15px; border-bottom: 1px solid #eee; }
          tr:hover { background: #f8f9fa; }
          .priority-high { color: #e74c3c; font-weight: bold; }
          .priority-medium { color: #f39c12; }
          .priority-low { color: #27ae60; }
          .badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .badge-daily { background: #e74c3c20; color: #c0392b; }
          .badge-weekly { background: #3498db20; color: #2980b9; }
          .badge-monthly { background: #2ecc7120; color: #27ae60; }
          .url { color: #2980b9; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📊 Katwanyaa School Sitemap</h1>
          <p>This sitemap contains <strong><xsl:value-of select="count(urlset/url)"/></strong> public pages indexed for search engines.</p>
          
          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th>Last Modified</th>
                <th>Change Frequency</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="urlset/url">
                <tr>
                  <td>
                    <a class="url">
                      <xsl:attribute name="href">
                        <xsl:value-of select="loc"/>
                      </xsl:attribute>
                      <xsl:value-of select="loc"/>
                    </a>
                  </td>
                  <td><xsl:value-of select="lastmod"/></td>
                  <td>
                    <span>
                      <xsl:attribute name="class">
                        badge badge-<xsl:value-of select="changefreq"/>
                      </xsl:attribute>
                      <xsl:value-of select="changefreq"/>
                    </span>
                  </td>
                  <td>
                    <xsl:choose>
                      <xsl:when test="priority &gt;= 0.9">
                        <span class="priority-high"><xsl:value-of select="priority"/></span>
                      </xsl:when>
                      <xsl:when test="priority &gt;= 0.6">
                        <span class="priority-medium"><xsl:value-of select="priority"/></span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="priority-low"><xsl:value-of select="priority"/></span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d; font-size: 14px;">
            <p>Generated: <xsl:value-of select="urlset/url[1]/lastmod"/></p>
            <p>Pages excluded from search indexing: /api/, /adminLogin, /forgotpassword, /MainDashboard</p>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>