### `97bd59ceb1fe7d52645093a79cc3ba05ad5ff564`

```text
Creation speed
                   name     ops/sec     MoE samples
ProducedBezier Generic    9,974,613 ± 0.78%      90
ProducedBezier Specific     259,425 ± 0.47%      93
                 Bezier 687,557,324 ± 0.53%      87
              ND Bezier 676,423,784  ± 0.9%      90
           Cubic Bezier 678,533,852 ± 1.37%      90
At speed
                   name     ops/sec     MoE samples
ProducedBezier Generic   56,898,368 ± 0.33%      87
ProducedBezier Specific 694,696,764 ± 0.34%      91
                 Bezier   8,920,163 ± 0.34%      89
              ND Bezier   2,546,229 ± 0.57%      89
           Cubic Bezier  19,353,505 ± 0.63%      91
```

```text
Creation speed
            name ops/sec     MoE samples
 produce-generic 401,126 ± 0.59%      92
produce-specific 150,801 ± 0.42%      96
     nd-iterativ 377,414 ± 0.68%      91
        nd-cubic 418,826 ± 0.44%      92
     2d-iterativ 400,586 ± 0.43%      94
At speed
            name    ops/sec     MoE samples
 produce-generic  3,522,472 ± 0.44%      95
produce-specific 30,702,477 ± 0.39%      95
     nd-iterativ  1,936,785 ± 0.58%      92
        nd-cubic  3,526,484 ± 0.52%      93
     2d-iterativ  3,239,002 ± 0.54%      98
```

```
create-at
             name ops/sec     MoE samples
 produced-generic 430,469 ± 0.47%      90
produced-specific 143,194 ± 0.49%      89
      nd-iterativ 402,654  ± 1.4%      93
         nd-cubic 449,023  ± 0.3%      93
      2d-iterativ 439,093 ± 0.39%      91

at
             name    ops/sec     MoE samples
 produced-generic  3,621,272 ± 0.39%      92
produced-specific 34,888,106 ± 0.34%      90
      nd-iterativ  2,026,051  ± 0.4%      91
         nd-cubic  3,620,254 ± 0.28%      92
      2d-iterativ  3,279,738 ± 0.26%      91
```

### v0.1.0

```text
create-at
             name ops/sec     MoE samples
 produced-generic 401,281 ± 0.36%      89
produced-specific 140,400 ± 0.17%      94
      nd-iterativ 368,200 ± 0.37%      92
         nd-cubic 394,002 ± 1.14%      93
      2d-iterativ 388,142 ± 1.12%      92

at
             name    ops/sec     MoE samples
 produced-generic  2,461,096 ± 0.16%      94
produced-specific 33,330,328 ± 0.21%      92
      nd-iterativ  1,630,860 ± 0.15%      93
         nd-cubic  2,457,887 ± 0.16%      94
      2d-iterativ  2,496,713 ± 0.17%      92

t-search
         name ops/sec     MoE samples
binary-search 150,140 ± 0.22%      92
deterministic 686,417 ± 0.37%      89
```
