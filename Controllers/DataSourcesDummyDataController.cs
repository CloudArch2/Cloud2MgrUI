using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace CljReactUI.Controllers
{
    [Route("api/[controller]")]
    public class DataSourcesDummyData : Controller
    {
        private static string[] SourceNames = new[]
{
            "Partner", "Sales", "Nonsense"
        };

        [HttpGet("[action]")]
        public IEnumerable<DataSource> DataSources(int startDateIndex)
        {
            var rng = new Random();
            return Enumerable.Range(0, 3).Select(index => new DataSource
                {
                    CommonName = SourceNames[index],
                    FieldX = new string[]{"OneField", "TwoField", "BlueField", "RedField" }
                });
        }

       
        public class DataSource
        {
            public string CommonName { get; set; }
            public string[] FieldX{ get; set; }
        }
    }
}
